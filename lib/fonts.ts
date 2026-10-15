import { IBM_Plex_Mono, IBM_Plex_Sans, Inter, Montserrat, Playfair_Display, Poppins, Source_Serif_4 } from "next/font/google"

// Fonts used by resume templates
export const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair" })
export const inter = Inter({ subsets: ["latin"], display: "swap" })
export const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" })
export const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" })
export const sourceSerif = Source_Serif_4({ subsets: ["latin"], display: "swap", style: ["normal", "italic"] })
export const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" })
export const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap" })
