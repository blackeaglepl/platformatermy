import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Package } from '@/types/package';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface PaginatedPackages {
    data: Package[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props extends PageProps {
    packages: PaginatedPackages;
    filters: {
        search?: string;
        status?: string;
    };
}

type FilterType = 'wszystkie' | 'aktywne' | 'wykorzystane';

export default function Index({ packages, filters }: Props) {
    const [filter, setFilter] = useState<FilterType>((filters.status as FilterType) || 'wszystkie');
    const [searchQuery, setSearchQuery] = useState<string>(filters.search || '');

    // Debounced search - wait 500ms after user stops typing
    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get(
            route('packages.index'),
            {
                search: value || undefined,
                status: filter !== 'wszystkie' ? filter : undefined
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    }, 500);

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedSearch(value);
    };

    // Handle filter change
    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        router.get(
            route('packages.index'),
            {
                search: searchQuery || undefined,
                status: newFilter !== 'wszystkie' ? newFilter : undefined
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Handle pagination
    const handlePageChange = (url: string | null) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

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
                                        Wyświetlane: {packages.from || 0}-{packages.to || 0} z {packages.total}
                                    </span>
                                </div>

                                {/* Search Input */}
                                <div className="mb-4">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                        Wyszukaj po ID lub posiadaczu:
                                    </label>
                                    <input
                                        id="search"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder='np. "20251015-01", "Jan Kowalski"...'
                                        className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => handleSearchChange('')}
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
                                            onChange={(e) => handleFilterChange(e.target.value as FilterType)}
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
                                            onChange={(e) => handleFilterChange(e.target.value as FilterType)}
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
                                            onChange={(e) => handleFilterChange(e.target.value as FilterType)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Wykorzystane <span className="text-gray-500">(100%)</span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {packages.total === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Brak pakietów. Dodaj pierwszy pakiet klikając przycisk "Dodaj Pakiet".</p>
                                </div>
                            ) : packages.data.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Brak pakietów spełniających wybrane kryteria filtrowania.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ID Pakietu
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Posiadacz
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
                                                {packages.data.map((pkg) => (
                                                    <tr
                                                        key={pkg.id}
                                                        className={pkg.is_fully_used ? 'bg-gray-200' : 'hover:bg-gray-50'}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                            {pkg.package_id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {pkg.owner_name}
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

                                    {/* Pagination Controls */}
                                    {packages.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                            <div className="flex flex-1 justify-between sm:hidden">
                                                <button
                                                    onClick={() => handlePageChange(packages.links[0]?.url)}
                                                    disabled={!packages.links[0]?.url}
                                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Poprzednia
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange(packages.links[packages.links.length - 1]?.url)}
                                                    disabled={!packages.links[packages.links.length - 1]?.url}
                                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Następna
                                                </button>
                                            </div>
                                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        Pokazuję <span className="font-medium">{packages.from}</span> do{' '}
                                                        <span className="font-medium">{packages.to}</span> z{' '}
                                                        <span className="font-medium">{packages.total}</span> wyników
                                                    </p>
                                                </div>
                                                <div>
                                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                        {packages.links.map((link, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handlePageChange(link.url)}
                                                                disabled={!link.url || link.active}
                                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                                    link.active
                                                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                                } ${
                                                                    !link.url ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                                                } ${
                                                                    index === 0 ? 'rounded-l-md' : ''
                                                                } ${
                                                                    index === packages.links.length - 1 ? 'rounded-r-md' : ''
                                                                }`}
                                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                            />
                                                        ))}
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
