import { useHomey } from '@/components/homey-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

interface AppVersion {
  version: string;
}

interface App {
  identifier: string;
  name: string;
  versions: AppVersion[];
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { homey } = useHomey();
  const [apps, setApps] = useState<App[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    homey.on('authorized', () => {
      setIsLoggedIn(true);
    });

    homey.api('GET', '/login/', {}, (err: Error | null, loggedIn: boolean) => {
      if (loggedIn) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    fetch('https://homeycommunity.space/api/hcs/apps')
      .then((res) => res.json())
      .then((data: App[]) => {
        setApps(data);
      });
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Homey Community Store</h1>
        <p className="text-muted-foreground">
          Manage your HCS account and discover community apps
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="account" className="flex-1 max-w-[200px]">
            Account
          </TabsTrigger>
          {isLoggedIn && (
            <TabsTrigger value="store" className="flex-1 max-w-[200px]">
              Store
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>
                Manage your Homey Community Store account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isLoggedIn ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-lg">
                    {isLoggedIn ? 'Connected to HCS' : 'Not connected to HCS'}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {isLoggedIn ? (
                <Button
                  variant="destructive"
                  onClick={() => {
                    homey.api(
                      'POST',
                      '/login/',
                      { state: false },
                      (err: Error | null, success: boolean) => {
                        if (!err && success) setIsLoggedIn(false);
                      }
                    );
                  }}
                >
                  Disconnect Account
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => {
                    homey.api(
                      'POST',
                      '/login/',
                      { state: true },
                      (err: Error | null, success: boolean) => {
                        if (!err && success) setIsLoggedIn(true);
                      }
                    );
                  }}
                >
                  Connect Account
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {isLoggedIn && (
          <TabsContent value="store">
            <div className="grid gap-6 md:grid-cols-2">
              {apps.map((app) => (
                <Card key={app.identifier} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">{app.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-secondary rounded-md text-xs">
                        v{app.versions[0].version}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto">
                    <Button
                      onClick={() => {
                        toast({
                          title: 'Installing app...',
                          variant: 'default',
                        });
                        homey.api(
                          'POST',
                          '/apps/install/',
                          {
                            id: app.identifier,
                            version: app.versions[0].version,
                          },
                          (err: Error | null, success: boolean) => {
                            if (!err && success)
                              toast({
                                title: 'Successfully installed app',
                                description: `${app.name} has been installed`,
                                variant: 'default',
                              });
                          }
                        );
                      }}
                      variant="default"
                      className="w-full"
                    >
                      Install App
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
