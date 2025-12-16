// Validerar att ett värde är en giltig sträng
// Kollar att värdet finns (inte undefined eller null) OCH att det är en string
export function validateString(value) {
  return value !== undefined && value !== null && typeof value === "string";
}

// Validerar att ett värde är ett giltigt nummer
// Kollar att värdet finns, är ett nummer, och inte är NaN (Not a Number)
// NaN kan uppstå när vi t.ex. gör Number.parseInt("abc")
export function validateNumber(value) {
  return (
    value !== undefined &&
    value !== null &&
    typeof value === "number" &&
    !Number.isNaN(value)
  );
}
