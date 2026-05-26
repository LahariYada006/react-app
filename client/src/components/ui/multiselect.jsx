import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { X } from "lucide-react";
import * as React from "react";
import { forwardRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Command } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const CommandEmpty = forwardRef(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("py-6 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = "CommandEmpty";

const MultipleSelector = React.forwardRef(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
    },
    ref
  ) => {
    const inputRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const mouseOn = React.useRef(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [selected, setSelected] = React.useState(value || []);
    const [options, setOptions] = React.useState(
      transToGroupOption(arrayDefaultOptions, groupBy)
    );
    const [inputValue, setInputValue] = React.useState("");
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current,
        focus: () => inputRef.current?.focus(),
      }),
      [selected]
    );

    const handleUnselect = React.useCallback(
      (option) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected]
    );

    const handleKeyDown = React.useCallback(
      (e) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1];
              if (!lastSelectOption.fixed) {
                handleUnselect(selected[selected.length - 1]);
              }
            }
          }
          if (e.key === "Escape") {
            input.blur();
          }
        }
      },
      [handleUnselect, selected]
    );

    useEffect(() => {
      if (value) {
        setSelected(value);
      }
    }, [value]);

    useEffect(() => {
      if (!arrayOptions || onSearch) {
        return;
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy);
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption);
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options]);

    useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true);
        const res = await onSearch?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
        setIsLoading(false);
      };

      const exec = async () => {
        if (!onSearch || !open) return;
        if (triggerSearchOnFocus) {
          await doSearch();
        }
        if (debouncedSearchTerm) {
          await doSearch();
        }
      };

      void exec();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    // Filter selectables based on inputValue when not using async onSearch
    const filteredSelectables = React.useMemo(() => {
      const selectables = removePickedOption(options, selected);
      if (onSearch || !inputValue) return selectables;

      const filtered = {};
      for (const [key, values] of Object.entries(selectables)) {
        const matches = values.filter((opt) =>
          opt.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        if (matches.length > 0) filtered[key] = matches;
      }
      return filtered;
    }, [options, selected, inputValue, onSearch]);

    const hasNoResults = React.useMemo(() => {
      return Object.values(filteredSelectables).every((arr) => arr.length === 0);
    }, [filteredSelectables]);

    const CreatableItem = () => {
      if (!creatable) return null;
      if (
        isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
        selected.find((s) => s.value === inputValue)
      ) {
        return null;
      }

      const shouldShow =
        (!onSearch && inputValue.length > 0) ||
        (onSearch && debouncedSearchTerm.length > 0 && !isLoading);

      if (!shouldShow) return null;

      return (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={() => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length);
              return;
            }
            setInputValue("");
            const newOptions = [...selected, { value: inputValue, label: inputValue }];
            setSelected(newOptions);
            onChange?.(newOptions);
          }}
          className="cursor-pointer px-3 py-2 text-sm hover:bg-white/10 rounded-sm transition-colors"
        >
          {`Create "${inputValue}"`}
        </div>
      );
    };

    const EmptyItem = () => {
      if (!emptyIndicator) return null;

      if (hasNoResults) {
        return (
          <div className="py-6 px-3 text-center text-sm text-muted-foreground">
            {emptyIndicator}
          </div>
        );
      }

      return null;
    };

    return (
      <Command
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
        className={cn(
          "h-auto overflow-visible bg-transparent",
          commandProps?.className
        )}
        shouldFilter={false}
      >
        <div
          className={cn(
            "min-h-10 rounded-md border border-input text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            {
              "px-3 py-2": selected.length !== 0,
              "cursor-text": !disabled && selected.length !== 0,
            },
            className
          )}
          onClick={() => {
            if (disabled) return;
            inputRef.current?.focus();
          }}
        >
          <div className="flex flex-wrap gap-3">
            {selected
              .filter((option) => option?.value && option?.label)
              .map((option) => {
                return (
                  <Badge
                    key={option.value}
                    className={cn(
                      "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground bg-purple-500 p-2",
                      "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                      badgeClassName
                    )}
                    data-fixed={option.fixed}
                    data-disabled={disabled || undefined}
                  >
                    {option.label}
                    <button
                      className={cn(
                        "ml-1 rounded-full text-white outline-none",
                        (disabled || option.fixed) && "hidden"
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(option)}
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </Badge>
                );
              })}
            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              onValueChange={(value) => {
                setInputValue(value);
                inputProps?.onValueChange?.(value);
              }}
              onBlur={(event) => {
                if (mouseOn.current === false) {
                  setOpen(false);
                }
                inputProps?.onBlur?.(event);
              }}
              onFocus={(event) => {
                setOpen(true);
                triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
                inputProps?.onFocus?.(event);
              }}
              placeholder={
                hidePlaceholderWhenSelected && selected.length !== 0
                  ? ""
                  : placeholder
              }
              className={cn(
                "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                {
                  "w-full": hidePlaceholderWhenSelected,
                  "px-3 py-2": selected.length === 0,
                  "ml-1": selected.length !== 0,
                },
                inputProps?.className
              )}
            />
            <button
              type="button"
              onClick={() => setSelected(selected.filter((s) => s.fixed))}
              className={cn(
                (hideClearAllButton ||
                  disabled ||
                  selected.length < 1 ||
                  selected.filter((s) => s.fixed).length === selected.length) &&
                "hidden"
              )}
            >
              <X />
            </button>
          </div>
        </div>

        <div className="relative">
          {open && (
            <div
              className="absolute top-1 z-10 p-1 w-full rounded-md border bg-[#2c2e3b] border-[#2f303b] text-white shadow-md outline-none animate-in max-h-40 overflow-y-auto"
              onMouseLeave={() => {
                mouseOn.current = false;
              }}
              onMouseEnter={() => {
                mouseOn.current = true;
              }}
              onMouseUp={() => {
                inputRef.current?.focus();
              }}
            >
              {isLoading ? (
                <>{loadingIndicator}</>
              ) : (
                <>
                  <EmptyItem />
                  <CreatableItem />

                  {Object.entries(filteredSelectables).map(([key, dropdowns]) =>
                    key ? (
                      <div key={key} className="overflow-auto">
                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {key}
                        </div>
                        {dropdowns.map((option) => (
                          <div
                            key={option.value}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={() => {
                              if (option.disable) return;
                              if (selected.length >= maxSelected) {
                                onMaxSelected?.(selected.length);
                                return;
                              }
                              setInputValue("");
                              const newOptions = [...selected, option];
                              setSelected(newOptions);
                              onChange?.(newOptions);
                            }}
                            className={cn(
                              "cursor-pointer px-3 py-2 text-sm hover:bg-white/10 rounded-sm transition-colors",
                              option.disable &&
                              "cursor-default opacity-50 pointer-events-none"
                            )}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    ) : (
                      dropdowns.map((option) => (
                        <div
                          key={option.value}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => {
                            if (option.disable) return;
                            if (selected.length >= maxSelected) {
                              onMaxSelected?.(selected.length);
                              return;
                            }
                            setInputValue("");
                            const newOptions = [...selected, option];
                            setSelected(newOptions);
                            onChange?.(newOptions);
                          }}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm hover:bg-white/10 rounded-sm transition-colors",
                            option.disable &&
                            "cursor-default opacity-50 pointer-events-none"
                          )}
                        >
                          {option.label}
                        </div>
                      ))
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Command>
    );
  }
);

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function transToGroupOption(options, groupBy) {
  if (options.length === 0) {
    return {};
  }
  if (!groupBy) {
    return {
      "": options,
    };
  }

  const groupOption = {};
  options.forEach((option) => {
    const key = option[groupBy] || "";
    if (!groupOption[key]) {
      groupOption[key] = [];
    }
    groupOption[key].push(option);
  });
  return groupOption;
}

function removePickedOption(groupOption, picked) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption));

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter(
      (val) => !picked.find((p) => p.value === val.value)
    );
  }
  return cloneOption;
}

function isOptionsExist(groupOption, targetOption) {
  for (const [, value] of Object.entries(groupOption)) {
    if (
      value.some((option) => targetOption.find((p) => p.value === option.value))
    ) {
      return true;
    }
  }
  return false;
}