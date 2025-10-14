import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ auth }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        package_type: '1',
        custom_id: '',
        notes: '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('packages.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dodaj Nowy Pakiet
                </h2>
            }
        >
            <Head title="Dodaj Pakiet" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <InputLabel htmlFor="package_type" value="Typ Pakietu" />
                                    <select
                                        id="package_type"
                                        name="package_type"
                                        value={data.package_type}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        onChange={(e) => setData('package_type', e.target.value)}
                                    >
                                        <option value="1">Naturalna Harmonia</option>
                                        <option value="2">Termalna Ulga</option>
                                        <option value="3">Szept Miłości</option>
                                        <option value="4">Kobiecy Chill</option>
                                        <option value="5">Wspólna Regeneracja</option>
                                        <option value="6">Impreza Urodzinowa</option>
                                    </select>
                                    <InputError message={errors.package_type} className="mt-2" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="custom_id" value="ID Pakietu" />
                                    <TextInput
                                        id="custom_id"
                                        type="text"
                                        name="custom_id"
                                        value={data.custom_id}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('custom_id', e.target.value)}
                                        placeholder="np. Agata Kowalska"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        💡 Jeśli to ID już istnieje, system automatycznie doda numer (np. "Agata_Kowalska_2")
                                    </p>
                                    <InputError message={errors.custom_id} className="mt-2" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="notes" value="Uwagi dodatkowe (opcjonalne)" />
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={data.notes}
                                        maxLength={500}
                                        rows={4}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="np. Jacuzzi VIP z przystawkami, preferencje klienta..."
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-gray-500">
                                            Dodatkowe informacje o pakiecie (max 500 znaków)
                                        </p>
                                        <span className="text-xs text-gray-500">
                                            {data.notes.length} / 500
                                        </span>
                                    </div>
                                    <InputError message={errors.notes} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton className="ms-4" disabled={processing}>
                                        Dodaj Pakiet
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
