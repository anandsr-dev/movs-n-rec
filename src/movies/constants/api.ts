export const SEARCH_TMDB_RESPONSE_MESSAGES = {
    SUCCESS: 'Movies fetched successfully'
}

export const ADD_MOVIE_FROM_TMDB_RESPONSES = {
    SUCCESS: 'Movie added from TMDB successfully'
}

export const LIST_MOVIES_RESPONSE = {
    SUCCESS: 'Movies fetched successfully'
}

export const PAGINATION_CONFIG = {
    LIMIT: 50
};

export const UPDATE_MOVIE_RESPONSES = {
    SUCCESS: 'Movie updated successfully'
}

export const DELETE_MOVIE_RESPONSES = {
    SUCCESS: 'Movie deleted successfully'
}

export const ADD_REVIEW_RESPONSES = {
    SUCCESS: 'Review added successfully'
}

export const GET_ALL_REVIEWS_RESPONSES = {
    SUCCESS: 'Reviews fetched successfully'
}

export type EVENT_EMITTER_PAYLOAD = {
    movieTitle: string;
    genres: string[]
}