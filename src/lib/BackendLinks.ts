export const baseURL = "mock-api/";


export const BackendRoutes = {
  /* ----------------------------- AUTH ----------------------------- */
  health: `${baseURL}/health`,
  me:  `${baseURL}/users/me`,
  getUsers: `${baseURL}/users`,
  getUser: (id: string) => `${baseURL}/users/${id}`,

};