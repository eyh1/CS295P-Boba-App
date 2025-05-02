import {useState} from "react";
import TextField from "@mui/material/TextField";

function SearchBar({searchTerm}) {

    return  <TextField
            className="border-0 shadow-none w-100" 
            id="search-input"
            variant="standard" 
            placeholder="Search for a drink or cafe"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
                disableUnderline: true,     
            }}
        />

}

export default SearchBar