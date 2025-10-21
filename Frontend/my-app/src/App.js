import { useEffect } from 'react';
import Pages from './Pages';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import { messaging } from "./firebase"; 
import { onMessage } from "firebase/messaging"; 
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

function App() {
  useEffect(() => {
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("FCM Message received:", payload);
    toast.info(`${payload.notification.title} - ${payload.notification.body}`, {
      position: "top-right",
      autoClose: false,       
      closeOnClick: true,    
      pauseOnHover: true,     
      hideProgressBar: true,  
    });
  });

  return () => unsubscribe();
}, []);
  return (
    <>
      <Header />
      <Navbar />
      <Pages />
      <ToastContainer />
    </>
  );
}

export default App;
