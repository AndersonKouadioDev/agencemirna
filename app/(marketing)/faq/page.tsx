import { Metadata } from "next";
import { getActiveFaqs } from "@/src/actions/public";

export const metadata: Metadata = {
  title: "FAQ | Agence Mirna",
  description: "Foire aux questions",
};

export default async function FAQPage() {
  const faqs = await getActiveFaqs();

  return (
    <div className="bg-[#FAF5EE] min-h-screen pt-40 sm:pt-48 pb-20">
      <div className="container mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-bold font-agate text-secondary mb-8 text-center">Questions Fréquentes</h1>
        
        <div className="space-y-6">
          {faqs.length === 0 ? (
            <p className="text-center text-stone-500">Aucune question fréquente disponible pour le moment.</p>
          ) : (
            faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                <h3 className="text-lg font-bold text-secondary mb-2">{faq.question}</h3>
                <p className="text-stone-600 whitespace-pre-wrap">{faq.answer}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
