import Image from "next/image";
import Motion from "@/components/motion";

export default function MapsSection() {
  return (
    <section
      id="hero"
      className="relative bg-primary/5 overflow-hidden isolate py-32 mx-auto max-w-screen-2xl"
    >
      <div className="container relative">
        <Motion variant="verticalSlideIn">
          <h2 className="text-2xl text-center mx-auto max-w-2xl sm:text-3xl font-agate md:text-5xl font-bold">
            Où nous trouver
          </h2>
        </Motion>
        <div className="flex mt-16 flex-col md:flex-row mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="md:w-1/2 p-1 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15891.450846534099!2d-3.974513!3d5.284108!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1ef9bfc5c47b3%3A0xe3a9a3e2323b89db!2sMIRNA%20AGENCE!5e0!3m2!1sfr!2sci!4v1725455290017!5m2!1sfr!2sci"
              style={{ border: 0, width: "100%", height: "100%" }}
              allowFullScreen
              width="800"
              height="600"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="md:w-1/2 bg-primary/10">
            <Motion variant="verticalSlideIn" animationParams={{ delay: 0.1 }}>
              <Image
                src="/images/photos/immeuble.jpeg"
                alt="We Help You To Find Your Dream Home Image - Houz X Webflow Template"
                className="object-cover w-full h-full flex-grow"
                width={500}
                height={500}
              />
            </Motion>
          </div>
        </div>
      </div>
    </section>
  );
}
