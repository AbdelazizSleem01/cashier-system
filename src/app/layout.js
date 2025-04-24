import Footer from "./components/Footer";
import RootRedirector from "./components/RootRedirector";
import "./globals.css";

export const metadata = {
  title: "Cashier app",
  description: "Cashier app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RootRedirector> 
          {children}
          <Footer />
        </RootRedirector>
      </body>
    </html>
  );
}
