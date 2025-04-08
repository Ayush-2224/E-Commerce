import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js'
import toast from 'react-hot-toast';
import {io} from 'socket.io-client';
const BaseURL="http://localhost:5001"
export const useAuthStore = create((set,get) => ({
    authUser:null,
    isSignningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    onlineUsers:[],

    checkAuth: async()=>{
        try {
            // set({isCheckingAuth:true})
            const response =await axiosInstance.get('/auth/check')
            set({authUser:response.data})
            get().connectSocket()
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
            
            const response = await axiosInstance.post('/auth/signup',formData)
            toast.success("Account created successfully")
            set({authUser:response.data})
            get().connectSocket()
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
        finally{
            set({isSigningUp:false})
        }

        
    },
    logout: async()=>{
        try {
            await axiosInstance.post('/auth/logout')
            set({authUser:null})
            toast.success("Logged out successfully")
            get().dissconnectSocket()
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    },
    login: async(formData)=>{
        set({isLoggingIn:true})
        try {
            const response = await axiosInstance.post('/auth/login',formData)
            set({authUser:response.data})
            toast.success("Logged in successfully")
            get().connectSocket()            
            
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
        finally{
            set({isLoggingIn:false})
        }
    },
    updateProfile: async(formData)=>{
        set({isUpdatingProfile:true})
        try {
            const response = await axiosInstance.put('/auth/update-profile',formData)
            set({authUser:response.data})
            toast.success("Profile updated successfully")
        } catch (error) {``
            console.log(error)
            toast.error(error.response.data.message)
        }
        finally{
            set({isUpdatingProfile:false})
        }
    },
    connectSocket:()=>{
        const {authUser}=get()
        if(!authUser || get().socket?.connected) return
         const socket=io(BaseURL,{
                query:{
                    userId: authUser._id
                }
         })
         socket.connect()
         set({ socket: socket });
         socket.on("getOnlineUsers",(userIds)=>{
             set({onlineUsers:userIds})
         })
    },
    dissconnectSocket:()=>{
       if(get().socket?.connected){
           get().socket.disconnect()
       }
    }
    
}))