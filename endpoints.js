// Define your API endpoints here
module.exports = {
  // Base API paths
  API_BASE: '/api',
  
  // Auth endpoints
  AUTH: '/api/auth',
  REFRESH_TOKEN: '/api/refresh-token',
  AUTH_ROUTES: {
    LOGIN_REGISTER: '/',
    REFRESH_TOKEN: '/refresh-token',
  },
  
  // Profile endpoints
  PROFILE: '/api/profile',
  
  // User endpoints
  USERS: '/api/users',
  
  // Slider endpoints
  SLIDER_BASE: '/api/slider',
  SLIDER: {
    GET_ALL: '/get_all',
    ADD: '/add',
    UPDATE: '/update/:id',
    DELETE: '/delete_by_id',
    TOGGLE: '/toggle/:id',
  },
  
  // Pet Category endpoints
  PET_CATEGORY_BASE: '/api/pet-categories',
  PET_CATEGORY: {
    GET_ALL: '/',
    GET_BY_SLUG: '/category/:slug',
    ADD: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
  },
  
  // Breed endpoints
  BREED_BASE: '/api/breeds',
  BREED: {
    GET_ALL: '/',
    GET_BY_CATEGORY: '/category/:categoryId',
    GET_BY_SLUG: '/:slug',
    ADD: '/',
    UPDATE: '/:id',
    DELETE: '/:id',
  },
  
  // Map endpoints
  MAP_BASE: '/api/map',
  MAP: {
    GET_PLACES: '/get-places',
  },
  
  // Social Media endpoints
  POST_BASE: '/api/posts',
  COMMENT_BASE: '/api/comments',
  FOLLOW_BASE: '/api/follow',
  FEED_BASE: '/api/feed',
  
  // Wishlist and Saved Posts endpoints
  WISHLIST_BASE: '/api/wishlist',
  SAVED_POSTS_BASE: '/api/saved-posts',
  
  POST: {
    CREATE: '/',
    GET_ALL: '/',
    GET_BY_ID: '/:id',
    UPDATE: '/:id',
    DELETE: '/:id',
    LIKE: '/:id/like',
  },
  
  COMMENT: {
    CREATE: '/',
    GET_BY_POST: '/post/:postId',
    GET_REPLIES: '/:commentId/replies',
    UPDATE: '/:id',
    DELETE: '/:id',
    LIKE: '/:id/like',
  },
  
  FOLLOW: {
    FOLLOW_USER: '/:userId',
    UNFOLLOW_USER: '/:userId',
    GET_FOLLOWERS: '/:userId/followers',
    GET_FOLLOWING: '/:userId/following',
    ACCEPT_REQUEST: '/request/:followId/accept',
    REJECT_REQUEST: '/request/:followId/reject',
    PENDING_REQUESTS: '/requests/pending',
  },
  
  FEED: {
    GET_FEED: '/',
    EXPLORE: '/explore',
    USER_POSTS: '/user/:userId',
    HASHTAG: '/hashtag/:hashtag',
    TRENDING: '/trending/hashtags',
  },
  
  WISHLIST: {
    ADD_PET: '/:petId',
    REMOVE_PET: '/:petId',
    GET_WISHLIST: '/',
    CHECK_STATUS: '/status/:petId',
    GET_COUNT: '/count',
  },
  
  SAVED_POSTS: {
    SAVE_POST: '/:postId',
    UNSAVE_POST: '/:postId',
    GET_SAVED: '/',
    GET_FILTERED: '/filter',
    CHECK_STATUS: '/status/:postId',
    GET_COUNT: '/count',
  },
};
