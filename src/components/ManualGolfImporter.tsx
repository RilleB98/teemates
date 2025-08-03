import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Download, Upload, Trash2 } from "lucide-react";
import { Course } from "@/data/golfCourses";
import course1 from "@/assets/course1.jpg";

interface ManualCourseData {
  name: string;
  location: string;
  rating: number;
  difficulty: string;
  holes: number;
  price: string;
  latitude: number;
  longitude: number;
}

export const ManualGolfImporter = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<ManualCourseData[]>([]);
  const [currentCourse, setCurrentCourse] = useState<ManualCourseData>({
    name: '',
    location: '',
    rating: 4.0,
    difficulty: 'Medium',
    holes: 18,
    price: '500 SEK',
    latitude: 59.3293,
    longitude: 18.0686
  });
  const [bulkText, setBulkText] = useState('');

  const addCourse = () => {
    if (!currentCourse.name.trim() || !currentCourse.location.trim()) {
      toast({
        title: "Ofullständig data",
        description: "Namn och plats är obligatoriska",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setCourses([...courses, { ...currentCourse }]);
    setCurrentCourse({
      name: '',
      location: '',
      rating: 4.0,
      difficulty: 'Medium',
      holes: 18,
      price: '500 SEK',
      latitude: 59.3293,
      longitude: 18.0686
    });

    toast({
      title: "Golfbana tillagd! ⛳",
      description: `${currentCourse.name} har lagts till`,
      duration: 2000,
    });
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const processBulkText = () => {
    const lines = bulkText.split('\n').filter(line => line.trim());
    const newCourses: ManualCourseData[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 3) continue;

      // Try to extract location if format is "Name, Location"
      const parts = trimmed.split(',');
      const name = parts[0].trim();
      const location = parts.length > 1 ? parts[1].trim() : 'Sverige';

      newCourses.push({
        name,
        location,
        rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
        holes: [9, 18, 27][Math.floor(Math.random() * 3)],
        price: `${Math.floor(Math.random() * 950) + 250} SEK`,
        latitude: parseFloat((Math.random() * 14 + 55).toFixed(4)),
        longitude: parseFloat((Math.random() * 14 + 10).toFixed(4))
      });
    }

    setCourses([...courses, ...newCourses]);
    setBulkText('');

    toast({
      title: "Bulk-import slutförd! 📥",
      description: `Lagt till ${newCourses.length} golfbanor`,
      duration: 3000,
    });
  };

  const exportCourses = () => {
    const fullCourses: Course[] = courses.map(course => ({
      ...course,
      image: course1
    }));

    const jsonContent = JSON.stringify(fullCourses, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manual-golf-courses.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export slutförd! 📁",
      description: `${courses.length} golfbanor exporterade`,
      duration: 3000,
    });
  };

  const loadSampleData = () => {
    const sampleCourses: ManualCourseData[] = [
      {
        name: "Arlandastad Golf",
        location: "Stockholm",
        rating: 4.3,
        difficulty: "Medium",
        holes: 18,
        price: "650 SEK",
        latitude: 59.6519,
        longitude: 17.9186
      },
      {
        name: "Kungsängen Golf Club",
        location: "Stockholm",
        rating: 4.1,
        difficulty: "Easy",
        holes: 18,
        price: "480 SEK",
        latitude: 59.4722,
        longitude: 17.7361
      },
      {
        name: "Hills Golf Club",
        location: "Göteborg",
        rating: 4.7,
        difficulty: "Hard",
        holes: 18,
        price: "850 SEK",
        latitude: 57.7089,
        longitude: 11.9746
      },
      {
        name: "Malmö Burlöv Golf",
        location: "Malmö",
        rating: 4.0,
        difficulty: "Medium",
        holes: 18,
        price: "520 SEK",
        latitude: 55.7047,
        longitude: 13.0865
      },
      {
        name: "Hooks Herrgård",
        location: "Göteborg",
        rating: 4.8,
        difficulty: "Hard",
        holes: 18,
        price: "920 SEK",
        latitude: 58.0378,
        longitude: 12.1764
      }
    ];

    setCourses([...courses, ...sampleCourses]);
    
    toast({
      title: "Exempel-data laddad! 🎯",
      description: `Lagt till ${sampleCourses.length} exempel-golfbanor`,
      duration: 3000,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Manual Add Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-golf-premium">
            <Plus className="w-5 h-5" />
            Lägg till golfbana manuellt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                value={currentCourse.name}
                onChange={(e) => setCurrentCourse({...currentCourse, name: e.target.value})}
                placeholder="Bro Hof Slott Golf Club"
              />
            </div>
            <div>
              <Label htmlFor="location">Plats</Label>
              <Input
                id="location"
                value={currentCourse.location}
                onChange={(e) => setCurrentCourse({...currentCourse, location: e.target.value})}
                placeholder="Stockholm"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="rating">Betyg</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={currentCourse.rating}
                onChange={(e) => setCurrentCourse({...currentCourse, rating: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Svårighet</Label>
              <select
                id="difficulty"
                value={currentCourse.difficulty}
                onChange={(e) => setCurrentCourse({...currentCourse, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <Label htmlFor="holes">Hål</Label>
              <select
                id="holes"
                value={currentCourse.holes}
                onChange={(e) => setCurrentCourse({...currentCourse, holes: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={9}>9</option>
                <option value={18}>18</option>
                <option value={27}>27</option>
              </select>
            </div>
            <div>
              <Label htmlFor="price">Pris</Label>
              <Input
                id="price"
                value={currentCourse.price}
                onChange={(e) => setCurrentCourse({...currentCourse, price: e.target.value})}
                placeholder="500 SEK"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitud</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={currentCourse.latitude}
                onChange={(e) => setCurrentCourse({...currentCourse, latitude: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitud</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={currentCourse.longitude}
                onChange={(e) => setCurrentCourse({...currentCourse, longitude: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <Button onClick={addCourse} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till golfbana
          </Button>
        </CardContent>
      </Card>

      {/* Bulk Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-golf-premium">
            <Upload className="w-5 h-5" />
            Bulk-import från text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bulkText">Klistra in golfbanenamn (en per rad)</Label>
            <Textarea
              id="bulkText"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Arlandastad Golf, Stockholm&#10;Kungsängen Golf Club, Uppsala&#10;Hills Golf Club, Göteborg"
              className="min-h-[120px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={processBulkText} disabled={!bulkText.trim()}>
              <Upload className="w-4 h-4 mr-2" />
              Importera från text
            </Button>
            <Button onClick={loadSampleData} variant="outline">
              Ladda exempel-data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tillagda golfbanor ({courses.length})</span>
              <Button onClick={exportCourses}>
                <Download className="w-4 h-4 mr-2" />
                Exportera JSON
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {courses.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">{course.name}</h4>
                    <p className="text-sm text-gray-600">
                      {course.location} • {course.holes} hål • {course.difficulty} • {course.price}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeCourse(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};