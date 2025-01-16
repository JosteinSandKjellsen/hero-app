import { useTranslations } from 'next-intl';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';

interface PrivacyPolicyPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyPopover({ isOpen, onClose }: PrivacyPolicyPopoverProps): JSX.Element | null {
  const t = useTranslations('Privacy');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <IoClose size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <IoShieldCheckmarkOutline size={32} className="text-primary" />
            <h2 className="text-2xl font-bold">{t('title')}</h2>
          </div>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t('introduction.title')}</h3>
            <p className="mb-4">{t('introduction.content')}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{t('dataCollection.title')}</h3>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">{t('dataCollection.photos.title')}</h4>
              <p>{t('dataCollection.photos.content')}</p>
              <ul className="list-disc ml-6 mt-2">
                {t.raw('dataCollection.photos.points').map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">{t('dataCollection.quiz.title')}</h4>
              <p>{t('dataCollection.quiz.content')}</p>
              <ul className="list-disc ml-6 mt-2">
                {t.raw('dataCollection.quiz.points').map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">{t('dataCollection.generated.title')}</h4>
              <p>{t('dataCollection.generated.content')}</p>
              <ul className="list-disc ml-6 mt-2">
                {t.raw('dataCollection.generated.points').map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t('thirdParty.title')}</h3>
            <h4 className="text-lg font-semibold mb-2">{t('thirdParty.leonardo.title')}</h4>
            <p>{t('thirdParty.leonardo.content')}</p>
            <ul className="list-disc ml-6 mt-2">
              {t.raw('thirdParty.leonardo.points').map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t('storage.title')}</h3>
            <ul className="list-disc ml-6">
              {t.raw('storage.points').map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t('rights.title')}</h3>
            <p>{t('rights.content')}</p>
            <ul className="list-disc ml-6 mt-2">
              {t.raw('rights.points').map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t('notStored.title')}</h3>
            <p>{t('notStored.content')}</p>
            <ul className="list-disc ml-6 mt-2">
              {t.raw('notStored.points').map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">{t('contact.title')}</h3>
            <p>{t('contact.content')}</p>
            <p className="mt-2">{t('contact.email')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
