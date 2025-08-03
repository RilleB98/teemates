import { Check, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender_profile?: {
    name: string;
    avatar_url: string;
  };
  receiver_profile?: {
    name: string;
    avatar_url: string;
  };
}

interface FriendRequestsProps {
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onAccept: (requestId: string, senderId: string) => void;
  onReject: (requestId: string) => void;
}

export const FriendRequests = ({ 
  pendingRequests, 
  sentRequests, 
  onAccept, 
  onReject 
}: FriendRequestsProps) => {
  if (pendingRequests.length === 0 && sentRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Inga väntande vänförfrågningar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Vänförfrågningar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="relative">
              Mottagna
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">
              Skickade
              {sentRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-4 space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Inga mottagna förfrågningar
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.sender_profile?.avatar_url || ''} />
                      <AvatarFallback>
                        {request.sender_profile?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {request.sender_profile?.name || 'Okänd användare'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { 
                          addSuffix: true, 
                          locale: sv 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAccept(request.id, request.user_id)}
                      variant="default"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onReject(request.id)}
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-4 space-y-3">
            {sentRequests.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Inga skickade förfrågningar
              </div>
            ) : (
              sentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.receiver_profile?.avatar_url || ''} />
                      <AvatarFallback>
                        {request.receiver_profile?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {request.receiver_profile?.name || 'Okänd användare'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Skickad {formatDistanceToNow(new Date(request.created_at), { 
                          addSuffix: true, 
                          locale: sv 
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Väntande</Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};