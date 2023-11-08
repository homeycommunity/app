
import { useHomey } from "@/components/homey-provider";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export default function App () {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { homey } = useHomey();
    const [apps, setApps] = useState<{ identifier: string, name: string, versions: { version: string }[] }[]>([]);
    const { toast } = useToast();
    useEffect(() => {
        homey.on('authorized', () => {
            setIsLoggedIn(true);
        })
        homey.api('GET', '/login/', {}, function (err, loggedIn) {
            console.log('hest');
            if (loggedIn) {
                setIsLoggedIn(true)
            } else {
                setIsLoggedIn(false);
            }
        });

        fetch('https://homeycommunity.space/api/hcs/apps').then(res => res.json()).then(data => {
            setApps(data);
        });
    }, [])
    return <Tabs defaultValue="account" className="w-full">
        <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="store">Store</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
            {isLoggedIn ? "You are logged in." : "You are not logged in."}
            {isLoggedIn ? <button onClick={() => {
                homey.api('POST', '/login/', { state: false }, function (err, success) {
                    if (!err && success) setIsLoggedIn(false);
                });
            }}>Logout</button> : <button onClick={() => {
                homey.api('POST', '/login/', { state: true }, function (err, success) {
                    if (!err && success) setIsLoggedIn(true)
                });
            }}>Login</button>}
        </TabsContent>
        <TabsContent value="store">
            {apps.map(app => <Card key={app.identifier} className="mb-4">
                <CardTitle>{app.name}</CardTitle>
                <CardDescription>{app.versions[0].version}</CardDescription>
                <CardFooter>
                    <Button onClick={() => {
                        toast({ title: 'Installing app', variant: 'default' });
                        homey.api('POST', '/apps/install/', { id: app.identifier, version: app.versions[0].version }, function (err, success) {

                            if (!err && success) toast({ title: 'Installed app', variant: 'default' });;
                        });
                    }} variant="default">Install</Button>
                </CardFooter>
            </Card>)}
        </TabsContent>
    </Tabs>
}