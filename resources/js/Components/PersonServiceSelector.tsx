import { PackageServiceUsage } from '@/types/package';
import { router } from '@inertiajs/react';

interface Props {
    variantGroup: string;
    services: PackageServiceUsage[];
    isToggling: number | null;
    onToggle: (usage: PackageServiceUsage) => void;
}

export default function PersonServiceSelector({ variantGroup, services, isToggling, onToggle }: Props) {
    const getPersonNumber = (groupName: string): string => {
        const osobaMatch = groupName.match(/^osoba(\d+)_/);
        return osobaMatch ? osobaMatch[1] : '?';
    };

    const personNumber = getPersonNumber(variantGroup);
    const selectedService = services.find(s => s.is_used);

    const handleSelectService = (selectedUsage: PackageServiceUsage) => {
        if (selectedUsage.is_used) {
            // Clicking already selected service - unmark it
            onToggle(selectedUsage);
        } else {
            // Unmark previously selected service (if any)
            if (selectedService) {
                router.post(
                    route('package-usage.toggle', selectedService.id),
                    {},
                    { preserveScroll: true }
                );
            }

            // Mark new service
            onToggle(selectedUsage);
        }
    };

    return (
        <div className="mb-6">
            <div className="mb-3">
                <h4 className="font-semibold text-gray-800">
                    🧘 Osoba {personNumber}:
                </h4>
            </div>
            <div className="space-y-2">
                {services.map((service) => {
                    const isSelected = service.is_used;

                    return (
                        <div
                            key={service.id}
                            onClick={() => handleSelectService(service)}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                isSelected
                                    ? 'bg-green-50 border-green-400 shadow-sm'
                                    : 'bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="radio"
                                    name={`person-${variantGroup}`}
                                    checked={isSelected}
                                    readOnly
                                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-800">
                                        {service.service_name}
                                    </div>
                                    {service.service_description && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            {service.service_description}
                                        </div>
                                    )}
                                    {service.service_duration && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Czas trwania: {service.service_duration} min
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
