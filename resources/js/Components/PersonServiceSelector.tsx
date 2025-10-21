import { PackageServiceUsage } from '@/types/package';
import { router } from '@inertiajs/react';

interface Props {
    packageId: number;
    variantGroup: string;
    services: PackageServiceUsage[];
    isToggling: number | null;
    onToggle: (usage: PackageServiceUsage) => void;
}

export default function PersonServiceSelector({ packageId, variantGroup, services, isToggling, onToggle }: Props) {
    const getPersonNumber = (groupName: string): string => {
        const osobaMatch = groupName.match(/^osoba(\d+)_/);
        return osobaMatch ? osobaMatch[1] : '?';
    };

    const personNumber = getPersonNumber(variantGroup);

    const handleSelectService = (serviceToSelect: PackageServiceUsage) => {
        if (isToggling) return;

        if (serviceToSelect.is_used) {
            // If clicking an already-selected service, delegate to the parent
            // to show the confirmation modal.
            onToggle(serviceToSelect);
        } else {
            // If clicking a new service, use the atomic 'select-variant' route
            // to switch the selection within the group.
            router.post(
                route('package-usage.select-variant'),
                {
                    package_id: packageId,
                    variant_group: variantGroup,
                    service_ids: [serviceToSelect.id],
                },
                {
                    preserveScroll: true,
                }
            );
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
                    const isDisabled = isToggling !== null;

                    return (
                        <div
                            key={service.id}
                            onClick={() => !isDisabled && handleSelectService(service)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                                isDisabled
                                    ? 'cursor-not-allowed opacity-60'
                                    : 'cursor-pointer'
                            } ${
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
                                    disabled={isDisabled}
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