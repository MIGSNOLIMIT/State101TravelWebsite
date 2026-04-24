import { provinces } from "psgc";

export const APPLICATION_ADDRESS_INITIAL_VALUES = {
  buildingUnit: "",
  street: "",
  barangay: "",
  city: "",
  province: "",
};

function formatPsgcMunicipalityName(name, provinceName) {
  if (provinceName === "Metro Manila" && name === "Quezon") {
    return "Quezon City";
  }

  return name;
}

function buildPsgcProvinceOptions() {
  return provinces
    .all()
    .map((province) => ({
      value: province.name,
      label: province.name,
      cities: (province.municipalities || [])
        .map((municipality) => formatPsgcMunicipalityName(municipality.name, province.name))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right, "en", { sensitivity: "base" })),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "en", { sensitivity: "base" }));
}

export const APPLICATION_ADDRESS_PROVINCES = buildPsgcProvinceOptions();

function normalizeAddressValue(value) {
  return String(value || "").trim().toLowerCase();
}

export function findProvinceRecord(province) {
  const normalizedProvince = normalizeAddressValue(province);
  if (!normalizedProvince) return null;

  return APPLICATION_ADDRESS_PROVINCES.find(
    (item) => normalizeAddressValue(item.value) === normalizedProvince || normalizeAddressValue(item.label) === normalizedProvince
  ) || null;
}

export function getCitiesForProvince(province) {
  return findProvinceRecord(province)?.cities || [];
}

export function buildApplicationAddress(parts = {}) {
  return [
    String(parts.buildingUnit || "").trim(),
    String(parts.street || "").trim(),
    String(parts.barangay || "").trim(),
    String(parts.city || "").trim(),
    String(parts.province || "").trim(),
  ]
    .filter(Boolean)
    .join(", ");
}