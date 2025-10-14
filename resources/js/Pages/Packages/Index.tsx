import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Package } from '@/types/package';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';

interface Props extends PageProps {
    packages: Package[];
}

type FilterType = 'wszystkie' | 'aktywne' | 'wykorzystane';

export default function Index({ auth, packages }: Props) {
    const [filter, setFilter] = useState<FilterType>('wszystkie');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredPackages = useMemo(() => {
        // First filter by status (wszystkie/aktywne/wykorzystane)
        let result = packages;
        switch (filter) {
            case 'wykorzystane':
                result = packages.filter(pkg => pkg.usage_percentage === 100);
                break;
            case 'aktywne':
                result = packages.filter(pkg => pkg.usage_percentage < 100);
                break;
            case 'wszystkie':
            default:
                result = packages;
        }

        // Then filter by search query (if provided)
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(pkg =>
                pkg.custom_id.toLowerCase().includes(query)
            );
        }

        return result;
    }, [packages, filter, searchQuery]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Pakiety
                </h2>
            }
        >
            <Head title="Pakiety" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Lista Pakietów
                                </h3>
                                <Link
                                    href={route('packages.create')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    Dodaj Pakiet
                                </Link>
                            </div>

                            {/* Filter Section */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Filtruj pakiety:
                                    </h4>
                                    <span className="text-sm text-gray-500">
                                        Wyświetlane: {filteredPackages.length} / {packages.length}
                                    </span>
                                </div>

                                {/* Search Input */}
                                <div className="mb-4">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                        Wyszukaj po ID pakietu:
                                    </label>
                                    <input
                                        id="search"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder='np. "Agata", "Kowalski", "2025"...'
                                        className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-2 text-sm text-gray-600 hover:text-gray-900 underline"
                                        >
                                            Wyczyść wyszukiwanie
                                        </button>
                                    )}
                                </div>

                                {/* Status Filter Radio Buttons */}
                                <div className="flex gap-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="packageFilter"
                                            value="wszystkie"
                                            checked={filter === 'wszystkie'}
                                            onChange={(e) => setFilter(e.target.value as FilterType)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Wszystkie
                                        </span>
                                    </label>

                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="packageFilter"
                                            value="aktywne"
                                            checked={filter === 'aktywne'}
                                            onChange={(e) => setFilter(e.target.value as FilterType)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Aktywne <span className="text-gray-500">({"<"}100%)</span>
                                        </span>
                                    </label>

                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="packageFilter"
                                            value="wykorzystane"
                                            checked={filter === 'wykorzystane'}
                                            onChange={(e) => setFilter(e.target.value as FilterType)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Wykorzystane <span className="text-gray-500">(100%)</span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {packages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Brak pakietów. Dodaj pierwszy pakiet klikając przycisk "Dodaj Pakiet".</p>
                                </div>
                            ) : filteredPackages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Brak pakietów spełniających wybrane kryteria filtrowania.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ID Pakietu
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Typ
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Wykorzystanie
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Utworzono przez
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Data utworzenia
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Akcje
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredPackages.map((pkg) => (
                                                <tr
                                                    key={pkg.id}
                                                    className={pkg.is_fully_used ? 'bg-gray-200' : 'hover:bg-gray-50'}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {pkg.custom_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {pkg.package_type_name || `Pakiet ${pkg.package_type}`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                                <div
                                                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                                                        pkg.is_fully_used ? 'bg-green-600' : 'bg-blue-600'
                                                                    }`}
                                                                    style={{ width: `${pkg.usage_percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-medium">
                                                                {pkg.usage_percentage}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {pkg.created_by}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {pkg.created_at}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            href={route('packages.show', pkg.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Szczegóły
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
