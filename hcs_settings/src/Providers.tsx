import { HomeyProvider } from "@/components/homey-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactNode } from "react";

export function Providers ({ children }: { children: ReactNode }) {
    return <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <HomeyProvider loading={() => <div>Loading</div>}>
            {children}
        </HomeyProvider>
    </ThemeProvider>
}