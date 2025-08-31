import { Navigation } from "@/components/Navigation";
import { PlayerCard } from "@/components/PlayerCard";
import { CourseCard } from "@/components/CourseCard";
import { ChatRoom } from "@/components/ChatRoom";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { useAuth } from "@/hooks/useAuth";
import player1 from "@/assets/player1.jpg";
import course1 from "@/assets/course1.jpg";

const Index = () => {
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();
  const { profiles, loading, userCity } = useNearbyProfiles();

  const samplePlayers = [
    {
      name: "Ahmed",
      age: 28,
      handicap: 12,
      location: "Stockholm",
      favoritesCourse: "Bro Hof Slott Golf Club",
      profileImage: player1,
      rating: 4.8,
      achievements: ["Klubbmästare", "Eagles Club"]
    },
    {
      name: "Emma",
      age: 32,
      handicap: 8,
      location: "Göteborg", 
      favoritesCourse: "Hills Golf Club",
      profileImage: player1,
      rating: 4.9,
      achievements: ["Turneringsvinnare", "Hole in One"]
    },
    {
      name: "Johan",
      age: 25,
      handicap: 15,
      location: "Malmö",
      favoritesCourse: "Malmö Burlöv Golf Club", 
      profileImage: player1,
      rating: 4.7,
      achievements: ["Nybörjartur", "Mest förbättrad"]
    }
  ];

  const sampleCourses = [
    {
      name: "Bro Hof Slott Golf Club",
      location: "Stockholm",
      rating: 4.9,
      difficulty: "Svår",
      holes: 18,
      price: "950 SEK",
      image: course1,
      activeUsers: 24
    },
    {
      name: "Hills Golf Club", 
      location: "Göteborg",
      rating: 4.7,
      difficulty: "Medel",
      holes: 18,
      price: "750 SEK",
      image: course1,
      activeUsers: 18
    },
    {
      name: "Malmö Burlöv Golf Club",
      location: "Malmö", 
      rating: 4.6,
      difficulty: "Lätt",
      holes: 18,
      price: "650 SEK",
      image: course1,
      activeUsers: 12
    }
  ];

  if (showChat) {
    return <ChatRoom onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <Navigation onMessagesClick={() => setShowChat(true)} />
      
      {/* Players Section */}
      <section className="py-8 px-4 sm:py-12 md:py-16 lg:py-20 sm:px-6 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-golf-premium mb-4 sm:mb-6">
              {user && userCity ? `Golfare från ${userCity}` : 'Träffa andra golfare'}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {user && userCity 
                ? `Träffa andra golfare som också bor i ${userCity}` 
                : 'Träffa passionerade golfare i ditt område och hitta dina perfekta spelpartners'}
            </p>
          </div>
          
          {user ? (
            loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center gap-2 text-base sm:text-lg text-muted-foreground">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-primary border-t-transparent"></div>
                  Laddar profiler...
                </div>
              </div>
            ) : profiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {profiles.map((profile, index) => (
                  <div key={profile.user_id} className="animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                    <PlayerCard 
                      name={profile.name}
                      age={profile.age}
                      handicap={profile.handicap}
                      location={profile.home_city}
                      favoritesCourse={profile.home_club || 'Ingen klubb vald'}
                      profileImage={profile.avatar_url || player1}
                      rating={4.5}
                      achievements={['Medlem']}
                    />
                  </div>
                ))}
              </div>
            ) : userCity ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <p className="text-base sm:text-lg text-muted-foreground">
                  Inga andra golfare från {userCity} hittades än. 
                </p>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  Kom tillbaka senare för att se nya medlemmar!
                </p>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 px-4">
                <p className="text-base sm:text-lg text-muted-foreground">
                  <Link to="/profile" className="text-primary hover:underline">
                    Välj din hemmastad i profilen
                  </Link> för att se golfare från din stad!
                </p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {samplePlayers.map((player, index) => (
                <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                  <PlayerCard {...player} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Courses Section */}
      <section className="py-8 px-4 sm:py-12 md:py-16 lg:py-20 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-slide-up">.
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-golf-premium mb-4 sm:mb-6">
              Upptäck fantastiska golfbanor
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Utforska de bästa golfbanorna och boka din nästa runda med andra spelare
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {sampleCourses.map((course, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                <CourseCard {...course} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-8 px-4 sm:py-12 md:py-16 lg:py-20 sm:px-6 bg-gradient-golf">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 animate-slide-up">
            Redo att slå av?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 animate-slide-up px-4">
            Gå med tusentals golfare som redan knyter kontakter och förbättrar sitt spel
          </p>
          <div className="animate-slide-up">
            <Link to="/auth">
              <button className="bg-white text-golf-green px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-white/90 transition-smooth shadow-premium touch-target">
                Kom igång idag
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
