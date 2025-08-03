import { useState } from 'react';
import { Course } from '@/data/golfCourses';
import course1 from '@/assets/course1.jpg';

export const useGolfCourseManager = () => {
  const [isAdding, setIsAdding] = useState(false);

  const generateRandomData = () => {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const holes = [9, 18, 27];
    const swedishLocations = [
      'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 
      'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 
      'Umeå', 'Gävle', 'Borås', 'Eskilstuna', 'Skåne', 'Småland', 'Dalarna'
    ];
    
    return {
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      holes: holes[Math.floor(Math.random() * holes.length)],
      price: `${Math.floor(Math.random() * 700) + 300} SEK`,
      location: swedishLocations[Math.floor(Math.random() * swedishLocations.length)],
      latitude: parseFloat((Math.random() * 14 + 55).toFixed(4)),
      longitude: parseFloat((Math.random() * 14 + 10).toFixed(4))
    };
  };

  const addGolfCourse = async (name: string): Promise<Course> => {
    setIsAdding(true);
    
    try {
      // Simulera loading för UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const randomData = generateRandomData();
      
      const newCourse: Course = {
        name: name.trim(),
        location: randomData.location,
        rating: randomData.rating,
        difficulty: randomData.difficulty,
        holes: randomData.holes,
        price: randomData.price,
        image: course1,
        latitude: randomData.latitude,
        longitude: randomData.longitude
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