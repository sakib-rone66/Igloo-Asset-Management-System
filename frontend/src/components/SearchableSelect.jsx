import { useEffect, useRef, useState } from "react";

import "./SearchableSelect.css";

function SearchableSelect({
  id,
  value,
  options,
  onChange,
  getOptionLabel,
  getOptionSearchText = getOptionLabel,
  placeholder,
  disabled = false,
  required = false,
  noOptionsMessage = "No options found.",
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((option) => option._id === value);
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : "";
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    getOptionSearchText(option).toLowerCase().includes(normalizedSearch),
  );

  useEffect(() => {
    setSearch(selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleChange = (event) => {
    setSearch(event.target.value);
    onChange("");
    setOpen(true);
  };

  const handleSelect = (option) => {
    onChange(option._id);
    setSearch(getOptionLabel(option));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="searchable-select">
      <input
        id={id}
        type="text"
        value={search}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        required={required}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-options`}
      />

      {open && !disabled && (
        <div id={`${id}-options`} className="searchable-select-dropdown">
          {filteredOptions.length === 0 ? (
            <div className="searchable-select-empty">{noOptionsMessage}</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                type="button"
                key={option._id}
                className="searchable-select-option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option)}
              >
                {getOptionLabel(option)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
