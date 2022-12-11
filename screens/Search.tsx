import React, { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components/native";
import { moviesApi, tvApi } from "../api";
import HList from "../components/HList";
import Loader from "../components/Loader";

const Container = styled.ScrollView``;
const SearchBar = styled.TextInput`
    background-color: white;
    padding: 10px 15px;
    margin: 10px auto;
    margin-bottom: 40px;
    width: 90%;
    border-radius: 15px;
`;

const Search = () => {
    const [query, setQuery] = useState("");
    const {
        isLoading: moviesLoading,
        data: moviesData,
        refetch: searchMovies,
    } = useQuery(["searchMovies", query], moviesApi.search, { enabled: false });
    const {
        isLoading: tvLoading,
        data: tvData,
        refetch: searchTv,
    } = useQuery(["searchTv", query], tvApi.search, { enabled: false });

    const onChangeText = (text: string) => setQuery(text);

    const onSubmit = () => {
        if (query === "") {
            return;
        }
        searchMovies();
        searchTv();
    };

    return (
        <Container>
            <SearchBar
                placeholder="Search for Moive or TV show"
                placeholderColor="grey"
                returnKeyType="search"
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
            />
            {moviesLoading || tvLoading ? <Loader /> : null}
            {moviesData ? (
                <HList title="Movie Results" data={moviesData.results} />
            ) : null}
            {tvData ? (
                <HList title="TV Reasults" data={tvData.results} />
            ) : null}
        </Container>
    );
};

export default Search;
