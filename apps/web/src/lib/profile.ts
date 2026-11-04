import data from "../../../../content/profile.json";

type PublicProfile = {
  name: string;
  headline: string;
  city: string;
  email: string;
  phone: string;
  phoneLabel: string;
  interests: string[];
};

export const profile: PublicProfile = data;
