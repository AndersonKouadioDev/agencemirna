import Motion from "../motion";

export default function StatesSection() {
  return (
    <section
      id="hero"
      className="relative bg-primary/5 isolate py-32 mx-auto max-w-screen-2xl"
    >
      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-[0.5fr_0.8fr] gap-4 md:gap-8">
          <div className="lg:col-span-1 lg:sticky lg:top-16 self-start">
            <div className="max-w-lg lg:sticky lg:top-0 z-10 p-8">
              <Motion variant="verticalSlideIn">
                <h2 className="text-4xl font-bold">
                  Découvrez{" "}
                  <span className="whitespace-nowrap">nos chiffres</span>
                </h2>
              </Motion>
              <Motion>
                <p className="text-lg mt-4">
                  L&apos;Agence Mirna, bien que jeune, a déjà fait ses preuves
                  sur le marché immobilier abidjanais. Notre croissance rapide
                  témoigne de notre engagement envers l&apos;excellence et la
                  satisfaction client.
                </p>
              </Motion>
              <Motion>
                <p className="text-lg mt-4">
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi{" "}
                  <span className="whitespace-nowrap">ut conset.</span>
                </p>
              </Motion>
            </div>
          </div>
          <div className="lg:justify-self-end w-full max-w-screen-md">
            <div className="grid grid-cols-1 gap-0">
              <StatItem
                titre="Clients satisfaits"
                description="Notre priorité absolue est la satisfaction de nos clients. Chaque sourire, chaque recommandation, chaque projet réussi nous motive à nous surpasser."
                valeur="500+"
              />
              <StatItem
                titre="Transactions réussies"
                description="De la location à la vente, en passant par la gestion locative, chaque transaction est une nouvelle histoire de succès pour nos clients."
                valeur="1 000+"
              />
              <StatItem
                titre="Agents dévoués"
                description="Notre équipe, bien que compacte, est composée de professionnels passionnés et hautement qualifiés, prêts à relever tous les défis immobiliers."
                valeur="10+"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const StatItem = ({
  titre,
  description,
  valeur,
}: {
  titre: string;
  description: string;
  valeur: string;
}) => {
  return (
    <Motion variant="verticalSlideIn">
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 py-12 md:py-16">
        <div className="max-w-xl mb-6 md:mb-0">
          <h3 className="text-3xl font-bold">{titre}</h3>
          <p className="text-lg mt-4">
            {description}
            cillum dolore <span className="whitespace-nowrap">eu fugiat.</span>
          </p>
        </div>
        <div className="text-4xl font-bold text-neutral-800">
          {valeur}
          <span className="text-primary ml-2">+</span>
        </div>
      </div>
    </Motion>
  );
};
