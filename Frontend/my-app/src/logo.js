import { useEffect, useState } from 'react';
import logoImage from '../assets/logo192.png';
import logo512 from '../assets/logo512.png';

// Copy the images to public folder during build
useEffect(() => {
  // This is just to ensure the image is imported
  console.log(logoImage, logo512);
}, []);