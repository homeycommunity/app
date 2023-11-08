import Homey from "@/Homey";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

type HomeyProviderProps = {
    children: ReactNode
    loading?: () => ReactNode
}

type HomeyProviderState = {
    homey?: typeof Homey
}

const initialState: HomeyProviderState = {};

const HomeyProviderContext = createContext<HomeyProviderState>(initialState)


export function HomeyProvider ({
    children,
    loading,
    ...props
}: HomeyProviderProps) {
    const [homeyAvailable, setHomeyAvailable] = useState(false);
    useEffect(() => {
        let raf = window.requestAnimationFrame(function cb () {
            if (window.HomeyReady) {
                setHomeyAvailable(true);
            } else {
                raf = window.requestAnimationFrame(cb);
            }
        })

        return () => {
            window.cancelAnimationFrame(raf);
        }
    }, [])


    if (homeyAvailable) {
        const value = {
            homey: Homey
        }

        return (
            <HomeyProviderContext.Provider {...props} value={value}>
                {children}
            </HomeyProviderContext.Provider>
        )
    }

    return <>{loading?.()}</>
}

export const useHomey = () => {
    const context = useContext(HomeyProviderContext)

    if (context === undefined)
        throw new Error("useHomey must be used within a HomeyProvider")

    return { homey: context.homey! };
}