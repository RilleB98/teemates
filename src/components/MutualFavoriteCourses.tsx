import { MapPin } from "lucide-react";

interface MutualCourse {
  id: string;
  name: string;
}

interface MutualFavoriteCoursesProps {
  mutualCourses: MutualCourse[];
}

export const MutualFavoriteCourses = ({ mutualCourses }: MutualFavoriteCoursesProps) => {
  if (!mutualCourses || mutualCourses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MapPin size={16} />
        <span>{mutualCourses.length} gemensamma favoritbanor</span>
      </div>
      
      <div className="space-y-1">
        {mutualCourses.slice(0, 2).map((course) => (
          <div key={course.id} className="bg-secondary/50 rounded-md px-3 py-2">
            <span className="text-sm font-medium">{course.name}</span>
          </div>
        ))}
        
        {mutualCourses.length > 2 && (
          <div className="bg-secondary/50 rounded-md px-3 py-2">
            <span className="text-sm text-muted-foreground">
              +{mutualCourses.length - 2} fler banor
            </span>
          </div>
        )}
      </div>
    </div>
  );
};