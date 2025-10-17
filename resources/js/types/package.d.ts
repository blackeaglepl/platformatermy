export interface PackageService {
    id: number;
    name: string;
    zone: 'relaksu' | 'odnowy' | 'smaku';
    description: string | null;
    duration: number | null;
}

export interface PackageServiceUsage {
    id: number;
    service_id: number;
    service_name: string;
    service_description: string | null;
    service_duration: number | null;
    instance_number: number | null;
    is_used: boolean;
    used_at: string | null;
    marked_by: string | null;
    notes: string | null;
    variant_group: string | null;  // null if not a variant
}

export interface Package {
    id: number;
    package_id: string;          // Auto-generated ID (format: YYYYMMDD-XX)
    owner_name: string;          // Package owner/recipient name (editable)
    package_type: number;
    package_type_name?: string;
    created_by: string;
    created_at: string;
    usage_percentage: number;
    is_fully_used: boolean;
    notes: string | null;
}

export interface PackageLog {
    id: number;
    action: string;
    user_name: string;
    created_at: string;
    details?: Record<string, any>;
}

export interface PackageWithUsages extends Package {
    usages_by_zone: {
        relaksu: PackageServiceUsage[];
        odnowy: PackageServiceUsage[];
        smaku: PackageServiceUsage[];
    };
    extra_usages: PackageServiceUsage[];
    logs: PackageLog[];
}

export interface PackageType {
    type: number;
    name: string;
    services_by_zone: {
        relaksu?: PackageService[];
        odnowy?: PackageService[];
        smaku?: PackageService[];
    };
}
