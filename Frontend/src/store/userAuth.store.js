import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js'
import toast from 'react-hot-toast';
// const BaseURL="http://localhost:5001/api/user"
export const useUserAuthStore = create((set,get) => ({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    checkAuth: async()=>{
        try {
            const response =await axiosInstance.get('/user/userInfo')
            set({authUser:response.data})
        } catch (error) {
            console.log(error)
            set({authUser:null})
        }
        finally{
            set({isCheckingAuth:false})
        }
    },
    signup: async (formData) => {
        set({isSigningUp:true})
        try {
            
            const response = await axiosInstance.post('/user/signup',formData)
            toast.success("Account created successfully")
            set({authUser:response.data})
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
            throw error
        }
        finally{
            set({isSigningUp:false})
        }

        
    },
    logout: async()=>{
        try {
            await axiosInstance.post('/user/logout')
            set({authUser:null})
            toast.success("Logged out successfully")
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
            throw error
        }
    },
    login: async(formData)=>{
        set({isLoggingIn:true})
        try {
            const response = await axiosInstance.post('/user/login',formData)
            set({authUser:response.data})
            return response.data
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
            throw error
        }
        finally{
            set({isLoggingIn:false})
        }
    },
    updateProfile: async(formData)=>{
        set({isUpdatingProfile:true})
        try {
            const response = await axiosInstance.post('/user/edit-profile',formData)
            set({authUser:response.data})
            toast.success("Profile updated successfully")
            const updatedUser= response.data.updatedUserData
            set({ authUser: updatedUser });
            return {updatedUser}
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
        finally{
            set({isUpdatingProfile:false})
        }
    },

  loginWithGoogle: () => {
    window.location.href = `http://localhost:5001/api/user/auth/google`;
  },

 
}))
