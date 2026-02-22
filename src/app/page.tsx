import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";
import FAQ from "@/components/BeforLogin/FAQ";
import Footer from "@/components/BeforLogin/Footor";
import Testimonials from "@/components/BeforLogin/Testimonials";
import Welcome from "@/components/BeforLogin/Welcome";

export default function Page() {
  return (
    <RedirectIfAuthenticated>
      <div>
        <Welcome />
        <FAQ />
        <Testimonials />
        <Footer />
      </div>
    </RedirectIfAuthenticated>
  );
}