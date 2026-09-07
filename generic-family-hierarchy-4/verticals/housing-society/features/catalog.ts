import {createProductizedFeatureCatalog} from "../../../capabilities/template-product/features";
import type {FeatureDefinition} from "../../../core/features/contracts";

const base=createProductizedFeatureCatalog("housing-society","Housing Society");
const foundation:FeatureDefinition<string,any,any>[]=[
 {key:"housing-society.core.property",bundle:"core",label:"Society property structure",description:"Building, wing, floor and flat/unit structure with occupancy context.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"housing-society.core.residents",bundle:"discover",label:"Residents & units",description:"Resident and unit discovery using society-scoped directory/search primitives.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"housing-society.core.my-flat",bundle:"core",label:"My Flat",description:"Claimed resident view of current flat, household context and vehicles.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"housing-society.core.occupancy-history",bundle:"core",label:"Owner & tenant history",description:"Time-bounded ownership, tenancy and occupancy facts without destructive overwrite.",minimumExperience:"admin",defaultLaunch:"released"},
 {key:"housing-society.core.parking",bundle:"core",label:"Vehicles & parking",description:"Resident vehicles and committee-governed parking slots/allocation history.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"housing-society.core.claiming",bundle:"core",label:"Resident claiming",description:"Verified-email invitation and identity claiming for resident profiles.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"housing-society.admin.bulk-onboarding",bundle:"admin",label:"Mapped bulk onboarding",description:"Excel/CSV column mapping for units, residents, occupancy, vehicles and parking.",minimumExperience:"admin",defaultLaunch:"released"},
 {key:"housing-society.ops.notices",bundle:"community",label:"Notices",description:"General, urgent and targeted resident notices with pinning and expiry.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"housing-society.ops.complaints",bundle:"community",label:"Complaints",description:"Resident service requests with assignment, SLA, comments and resolution lifecycle.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"housing-society.ops.vendors",bundle:"admin",label:"Vendors & contracts",description:"Committee-managed vendor directory and contract/AMC lifecycle.",minimumExperience:"admin",defaultLaunch:"released"},
 {key:"housing-society.ops.amenities",bundle:"community",label:"Amenities",description:"Resident amenity discovery and governed booking requests.",minimumExperience:"member",defaultLaunch:"released"},
 {key:"housing-society.ops.coming-up",bundle:"community",label:"Coming Up",description:"Upcoming society events, active notices and bookings in one resident-facing view.",minimumExperience:"member",defaultLaunch:"released"},
];
export const HOUSING_SOCIETY_FEATURE_CATALOG={...base,features:[...base.features.filter(f=>f.key!=="housing-society.shared.intelligence"),...foundation]};
