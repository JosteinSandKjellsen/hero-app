import { GeneratedHeroesTable } from '@/app/_components/generated-heroes/GeneratedHeroesTable';
import { Background } from '@/app/_components/layout/Background';

export default function GeneratedHeroesPage(): JSX.Element {
  return (
    <>
      <Background variant="stats" />
      <main className="min-h-screen py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-white">Generated Heroes</h1>
              <p className="mt-2 text-sm text-gray-300">
                A list of all generated heroes in the system, showing the last 50 entries. Entries older than a month are automatically removed.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <GeneratedHeroesTable />
          </div>
        </div>
      </main>
    </>
  );
}
