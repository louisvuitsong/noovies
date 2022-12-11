import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import {
    Dimensions,
    StyleSheet,
    Linking,
    TouchableOpacity,
    Share,
    Platform,
} from "react-native";
import styled from "styled-components/native";
import { Movie, moviesApi, TV, tvApi } from "../api";
import Poster from "../components/Poster";
import { makeImgPath } from "../utils";
import { LinearGradient } from "expo-linear-gradient";
import { BLACK_COLOR } from "../colors";
import { useQuery } from "react-query";
import Loader from "../components/Loader";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const Container = styled.ScrollView`
    background-color: ${(props) => props.theme.mainBgColor};
`;

const Header = styled.View`
    height: ${SCREEN_HEIGHT / 4}px;
    justify-content: flex-end;
    padding: 0px 20px;
`;
const Background = styled.Image``;

const Column = styled.View`
    flex-direction: row;
    width: 80%;
`;
const Title = styled.Text`
    color: white;
    align-self: flex-end;
    font-size: 36px;
    font-weight: 500;
    margin-left: 15px;
`;

const Data = styled.View`
    padding: 0px 20px;
`;

const Overview = styled.Text`
    color: ${(props) => props.theme.textColor};
    margin: 20px 0;
`;

const VideoBtn = styled.TouchableOpacity`
    flex-direction: row;
`;
const BtnText = styled.Text`
    color: white;
    font-weight: 600;
    margin-bottom: 20px;
    margin-left: 10px;
    line-height: 24px;
`;

type RootStackParamList = {
    Detail: Movie | TV;
};

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, "Detail">;

const Detail: React.FC<DetailScreenProps> = ({
    navigation: { setOptions },
    route: { params },
}) => {
    const isAndroid = Platform.OS === "android";
    const isMovie = "original_title" in params;
    const { isLoading, data } = useQuery(
        [isMovie ? "movies" : "tv", params.id],
        isMovie ? moviesApi.detail : tvApi.detail
    );

    const ShareMedia = async () => {
        const homepage = isMovie
            ? `https://www.imdb.com/title/${data.imdb_id}/`
            : data.homepage;

        if (isAndroid) {
            await Share.share({
                message: `${params.overview}\nCheck it out: ${homepage}`,
                title:
                    "original_title" in params
                        ? params.original_title
                        : params.original_name,
            });
        } else {
            await Share.share({
                url: homepage,
                title:
                    "original_title" in params
                        ? params.original_title
                        : params.original_name,
            });
        }
    };

    const ShareButton = () => (
        <TouchableOpacity onPress={ShareMedia}>
            <Ionicons name="share-outline" color="white" size={24} />
        </TouchableOpacity>
    );

    useEffect(() => {
        setOptions({
            title: "original_title" in params ? "Movie" : "TV show",
            headerRight: () => <ShareButton />,
        });
    }, []);

    useEffect(() => {
        if (data) {
            setOptions({
                headerRight: () => <ShareButton />,
            });
        }
    }, [data]);

    const openYTLink = async (videoID: string) => {
        const baseUrl = `http://m.youtube.com/watch?v=${videoID}`;
        // await Linking.openURL(baseUrl);
        await WebBrowser.openBrowserAsync(baseUrl);
    };

    return (
        <Container>
            <Header>
                <Background
                    style={StyleSheet.absoluteFill}
                    source={{ uri: makeImgPath(params.backdrop_path || "") }}
                />
                {isAndroid ? null : (
                    <LinearGradient
                        colors={["transparent", BLACK_COLOR]}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                <Column>
                    <Poster path={params.poster_path || ""} />
                    <Title>
                        {"original_title" in params
                            ? params.original_title
                            : params.original_name}
                    </Title>
                </Column>
            </Header>
            <Data>
                <Overview>{params.overview}</Overview>
                {isLoading ? <Loader /> : null}
                {data?.videos?.results?.map((video) => (
                    <VideoBtn
                        key={video.key}
                        onPress={() => {
                            openYTLink(video.key);
                        }}>
                        <Ionicons name="logo-youtube" color="white" size={24} />
                        <BtnText>{video.name}</BtnText>
                    </VideoBtn>
                ))}
            </Data>
        </Container>
    );
};

export default Detail;
