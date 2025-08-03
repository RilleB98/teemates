import { useState } from 'react';
import { Course } from '@/data/golfCourses';
import course1 from '@/assets/course1.jpg';

export const useGolfCourseManager = () => {
  const [isAdding, setIsAdding] = useState(false);

  const addGolfCourse = async (name: string, location: string): Promise<Course> => {
    setIsAdding(true);
    
    try {
      // Simulera loading för UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCourse: Course = {
        name: name.trim(),
        location: location.trim(),
        image: course1,
        latitude: parseFloat((Math.random() * 14 + 55).toFixed(4)),
        longitude: parseFloat((Math.random() * 14 + 10).toFixed(4))
      };

      // Här skulle vi normalt göra en API-call till backend
      // För nu loggar vi bara och returnerar kursen
      console.log('Adding golf course:', newCourse);
      
      return newCourse;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addGolfCourse,
    isAdding
  };
};