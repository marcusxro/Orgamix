interface Address {
    // Add fields if address details are known, else leave empty
  }
  
  interface IndividualDetail {
    date_of_birth: string | null;
    employment: string | null;
    gender: string | null;
    given_names: string;
    given_names_non_roman: string | null;
    nationality: string | null;
    place_of_birth: string | null;
    surname: string;
    surname_non_roman: string | null;
  }
  
  interface Customer {
    addresses: Address[]; // Array of addresses
    business_detail: any | null; // Replace 'any' with the appropriate type if known
    created: string; // ISO date string
    date_of_registration: string | null;
    description: string | null;
    domicile_of_registration: string | null;
    email: string;
    hashed_phone_number: string | null;
    id: string;
    identity_accounts: any[]; // Replace 'any' with the appropriate type if known
    individual_detail: IndividualDetail;
    kyc_documents: any[]; // Replace 'any' with the appropriate type if known
    metadata: Record<string, any> | null; // Metadata as key-value pairs
    mobile_number: string;
    phone_number: string | null;
    reference_id: string;
    type: string; // For example, "INDIVIDUAL"
    updated: string; // ISO date string
  }
  

  export default Customer;