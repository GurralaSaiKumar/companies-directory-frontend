import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    TextField,
    Typography,
    Box,
    TablePagination,
} from "@mui/material";
import axios from "axios";

export const CompaniesDirectoryTable = () => {


    const [rows, setRows] = useState([]);
    const [orderBy, setOrderBy] = useState("username");
    const [order, setOrder] = useState("asc");
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0);

    const GetData = async () => {
        try{
            const response = await axios.get("https://dummyjson.com/users");
        console?.log(response, "response", response?.data?.users)
        return setRows(response.data?.users);
    }
        catch(e){
             return setRows(e)
             console?.log(e,"e")
        }
    }

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        const newOrder = isAsc ? "desc" : "asc";
        setOrder(newOrder);
        setOrderBy(property);

        const sortedData = [...rows].sort((a, b) => {
            const getValue = (obj, prop) => {
                if (prop.includes(".")) {
                    return prop.split(".").reduce((o, key) => (o ? o[key] : ""), obj);
                }
                return obj[prop];
            };

            const aValue = getValue(a, property);
            const bValue = getValue(b, property);

            if (aValue < bValue) return newOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return newOrder === "asc" ? 1 : -1;
            return 0;
        });

        setRows(sortedData);
    };
    const deepSearch = (obj, searchText) => {
        if (obj == null) return false;
        const lowerSearch = searchText.toLowerCase();

        return Object.values(obj).some((value) => {
            if (value == null) return false;
            if (typeof value === "object") return deepSearch(value, searchText);
            return value.toString().toLowerCase().includes(lowerSearch);
        });
    };

    const filteredRows = useMemo(() => {
        if (!search.trim()) return rows;
        return rows.filter((row) => deepSearch(row, search));
    }, [rows, search]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const paginatedRows = filteredRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    useEffect(() => {
        GetData()
    }, [])
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Companies Directory
            </Typography>

            <TextField
                label="Search (filters all columns)"
                variant="outlined"
                size="small"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{
                        backgroundColor: "#459bf0ff",
                    }}>
                        <TableRow>
                            {[
                                { id: "username", label: "User Name" },
                                { id: "company.name", label: "Company Name" },
                                { id: "company.title", label: "Title" },
                                { id: "company.department", label: "Department" },
                            ].map((col) => (
                                <TableCell
                                    key={col.id}
                                    sortDirection={orderBy === col.id ? order : false}
                                    sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "16px",
                                        width: "25%"
                                    }}
                                >
                                    <TableSortLabel
                                        active={orderBy === col.id}
                                        direction={orderBy === col.id ? order : "asc"}
                                        onClick={() => handleSort(col.id)}
                                    >
                                        {col.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row) => (
                                <TableRow key={row.username}>
                                    <TableCell >{row.username}</TableCell>
                                    <TableCell>{row.company.name}</TableCell>
                                    <TableCell >{row.company.title}</TableCell>
                                    <TableCell >{row.company.department}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography color="text.secondary">No results found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredRows.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>
        </Box>
    );
};
