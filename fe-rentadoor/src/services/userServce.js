import axios from "axios";


const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

export const userService = {

    async getUserById(id) {
        const res = await axios.get(`${API_URL}/user/${id}`, { withCredentials: true });

        return res.data;
    }
}
