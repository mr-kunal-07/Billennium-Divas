import FAQ from '@/components/BeforLogin/FAQ'
import Footer from '@/components/BeforLogin/Footor'
import Testimonials from '@/components/BeforLogin/Testimonials'
import Welcome from '@/components/BeforLogin/Welcome'


const page = () => {

  return (
    <div>
      <Welcome />
      <FAQ />
      <Testimonials />
      <Footer />
    </div>
  )
}

export default page