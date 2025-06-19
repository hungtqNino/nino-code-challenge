import { useState, useEffect, useRef, FC, FormEvent, ChangeEvent } from "react";
import { MdSwapVert, MdKeyboardArrowDown } from "react-icons/md";
import {
  SwapContainer,
  Title,
  SwapForm,
  TokenInput,
  Input,
  TokenSelector,
  TokenImage,
  TokenSymbol,
  SwapButton,
  SwapIcon,
  TokenList,
  TokenOption,
  PriceInfo,
  OutputValue,
  NoResults,
  ErrorMessage,
} from "@/components/shared";
import { delay, formatNumber, getTokenImage } from "@/libs/utils";
import { getPrices } from "@/services/token.service";
import { MAXIMUM_AMOUNT, REGEX } from "@/libs/constants";
import { ShimmerLoadingOption } from "@/components/loading";
import { useClickOutsideDropdown } from "@/libs/hooks";
import { ClosingDownType, TokenData } from "@/services/token.type";

export const CurrencySwap: FC = () => {
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [outputAmount, setOutputAmount] = useState<string>("0.0");
  const [tokens, setTokens] = useState<TokenData>({});
  const [showFromTokens, setShowFromTokens] = useState<boolean>(false);
  const [showToTokens, setShowToTokens] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapAnimation, setSwapAnimation] = useState(false);
  const [closingDropdown, setClosingDropdown] = useState<ClosingDownType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredTokens, setFilteredTokens] = useState<TokenData>({});
  const [error, setError] = useState<string>("");

  const fromTokenRef = useRef<HTMLDivElement>(null);
  const toTokenRef = useRef<HTMLDivElement>(null);

  useClickOutsideDropdown({
    refs: [
      {
        ref: fromTokenRef,
        show: showFromTokens,
        onClose: () => {
          setShowFromTokens(false);
          setSearchQuery("");
        },
      },
      {
        ref: toTokenRef,
        show: showToTokens,
        onClose: () => {
          setShowToTokens(false);
          setSearchQuery("");
        },
      },
    ],
    setClosingDropdown,
  });

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const data = await getPrices();

      const tokenMap: TokenData = {};
      data.forEach((token) => {
        if (
          !tokenMap[token.currency] ||
          new Date(token.date) > new Date(tokenMap[token.currency].date)
        ) {
          tokenMap[token.currency] = {
            price: token.price,
            date: token.date,
          };
        }
      });
      setTokens(tokenMap);
    } catch (err) {
      console.error("Failed to fetch token prices:", err);
    }
  };

  useEffect(() => {
    const handleSearch = async () => {
      setIsSearching(true);
      setFilteredTokens({});

      await delay(1000);

      const filtered = Object.entries(tokens).reduce(
        (acc, [currency, data]) => {
          if (currency.toLowerCase().includes(searchQuery.toLowerCase())) {
            acc[currency] = data;
          }
          return acc;
        },
        {} as TokenData
      );

      setFilteredTokens(filtered);
      setIsSearching(false);
    };

    const debounceTimeout = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        setFilteredTokens(tokens);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, tokens]);

  useEffect(() => {
    if (Object.keys(tokens).length > 0) {
      const firstToken = Object.keys(tokens)[0];
      const secondToken = Object.keys(tokens)[1] || firstToken;
      if (!fromToken) setFromToken(firstToken);
      if (!toToken) setToToken(secondToken);
    }
  }, [tokens]);

  const handleSwap = async (e: FormEvent) => {
    e.preventDefault();
    setIsSwapping(true);

    await delay(1000);

    const rate = tokens[toToken].price / tokens[fromToken].price;
    if (rate && amount) {
      const result = formatNumber((parseFloat(amount) * rate).toString());
      setOutputAmount(result);
    }

    setIsSwapping(false);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (REGEX.ONLY_NUMBERS.test(value)) {
      setAmount(value);

      if (value === "") {
        setError("");
        setOutputAmount("0.0");
        return;
      }

      const num = parseFloat(value);
      if (num > MAXIMUM_AMOUNT) {
        setError("Maximum value is 10000");
        return;
      }

      if (value.includes(".")) {
        const [, decimal] = value.split(".");
        if (decimal && decimal.length > 8) {
          setError("Maximum 8 decimal places allowed");
          return;
        }
      }
      setError("");
    }
  };

  const switchTokens = async () => {
    if (isSwapping || showFromTokens || showToTokens) return;

    setIsSwapping(true);
    setSwapAnimation(true);

    await delay(250);

    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    const currentAmount = amount;

    await delay(250);

    const rate = tokens[toToken].price / tokens[fromToken].price;
    if (rate && currentAmount) {
      const result = formatNumber(
        (parseFloat(currentAmount) * rate).toString()
      );
      setOutputAmount(result);
    }

    setSwapAnimation(false);
    setIsSwapping(false);
  };

  const calculateExchangeRate = () => {
    if (!fromToken || !toToken || !tokens[fromToken] || !tokens[toToken])
      return null;
    return formatNumber(
      (tokens[toToken].price / tokens[fromToken].price).toString()
    );
  };

  return (
    <SwapContainer>
      <Title>Swap Currencies</Title>
      <SwapForm onSubmit={handleSwap}>
        <TokenInput
          ref={fromTokenRef}
          $isSwapping={swapAnimation}
          $isTop
          $hasError={!!error}
          datatype="from"
        >
          <Input
            type="text"
            placeholder="0.0"
            value={amount}
            onChange={handleAmountChange}
            style={{
              padding: 0,
            }}
          />
          <TokenSelector
            onClick={(e) => {
              e.preventDefault();
              if (showToTokens) {
                setClosingDropdown("to");
                setTimeout(() => {
                  setShowToTokens(false);
                  setClosingDropdown(null);
                }, 300);
              }
              if (showFromTokens) {
                setClosingDropdown("from");
                setTimeout(() => {
                  setShowFromTokens(false);
                  setClosingDropdown(null);
                }, 300);
              } else {
                setShowFromTokens(true);
              }
            }}
            aria-expanded={showFromTokens}
          >
            <TokenImage src={getTokenImage(fromToken)} alt={fromToken} />
            <MdKeyboardArrowDown size={24} color="white" />
          </TokenSelector>
          {(showFromTokens || closingDropdown === "from") && (
            <TokenList $isClosing={closingDropdown === "from"}>
              <Input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  fontSize: "16px",
                  padding: "8px 16px",
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                }}
                onClick={(e) => e.stopPropagation()}
              />
              {isSearching ? (
                <ShimmerLoadingOption />
              ) : Object.keys(filteredTokens).length === 0 ? (
                <NoResults>No tokens found</NoResults>
              ) : (
                Object.entries(filteredTokens).map(([currency]) => {
                  return (
                    <TokenOption
                      key={currency}
                      onClick={() => {
                        const rate =
                          tokens[currency].price / tokens[toToken].price;
                        const result = amount
                          ? formatNumber((parseFloat(amount) * rate).toString())
                          : "0.0";
                        setFromToken(currency);
                        setOutputAmount(result);
                        setClosingDropdown("from");
                        setTimeout(() => {
                          setShowFromTokens(false);
                          setClosingDropdown(null);
                        }, 300);
                      }}
                      disabled={currency === toToken || currency === fromToken}
                    >
                      <TokenImage
                        src={getTokenImage(currency)}
                        alt={currency}
                      />
                      <TokenSymbol>{currency}</TokenSymbol>
                    </TokenOption>
                  );
                })
              )}
            </TokenList>
          )}
        </TokenInput>

        <SwapIcon
          onClick={switchTokens}
          type="button"
          disabled={isSwapping || !!error}
          $isSwapping={swapAnimation}
        >
          <MdSwapVert size={32} />
        </SwapIcon>

        <TokenInput ref={toTokenRef} $isOutput datatype="to">
          <OutputValue $isLoading={isSwapping}>{outputAmount}</OutputValue>
          <TokenSelector
            onClick={(e) => {
              e.preventDefault();
              if (showFromTokens) {
                setClosingDropdown("from");
                setTimeout(() => {
                  setShowFromTokens(false);
                  setClosingDropdown(null);
                }, 300);
              }
              if (showToTokens) {
                setClosingDropdown("to");
                setTimeout(() => {
                  setShowToTokens(false);
                  setClosingDropdown(null);
                }, 300);
              } else {
                setShowToTokens(true);
              }
            }}
            aria-expanded={showToTokens}
          >
            <TokenImage src={getTokenImage(toToken)} alt={toToken} />
            <MdKeyboardArrowDown size={24} color="white" />
          </TokenSelector>
          {(showToTokens || closingDropdown === "to") && (
            <TokenList $isClosing={closingDropdown === "to"}>
              <Input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  fontSize: "16px",
                  padding: "8px 16px",
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                }}
                onClick={(e) => e.stopPropagation()}
              />
              {isSearching ? (
                <ShimmerLoadingOption />
              ) : Object.keys(filteredTokens).length === 0 ? (
                <NoResults>No tokens found</NoResults>
              ) : (
                Object.entries(filteredTokens).map(([currency]) => {
                  return (
                    <TokenOption
                      key={currency}
                      onClick={() => {
                        const rate =
                          tokens[fromToken].price / tokens[currency].price;
                        const result = amount
                          ? formatNumber((parseFloat(amount) * rate).toString())
                          : "0.0";
                        setToToken(currency);
                        setOutputAmount(result);
                        setClosingDropdown("to");
                        setTimeout(() => {
                          setShowToTokens(false);
                          setClosingDropdown(null);
                        }, 300);
                      }}
                      disabled={currency === toToken || currency === fromToken}
                    >
                      <TokenImage
                        src={getTokenImage(currency)}
                        alt={currency}
                      />
                      <TokenSymbol>{currency}</TokenSymbol>
                    </TokenOption>
                  );
                })
              )}
            </TokenList>
          )}
        </TokenInput>

        {fromToken && toToken && (
          <PriceInfo>
            1 {fromToken} = {calculateExchangeRate()} {toToken}
          </PriceInfo>
        )}

        {error && <ErrorMessage $isVisible>{error}</ErrorMessage>}

        <SwapButton
          type="submit"
          $isLoading={isSwapping}
          disabled={Boolean(error) || amount === "" || isSwapping}
        >
          {isSwapping ? "Converting..." : "Convert"}
        </SwapButton>
      </SwapForm>
    </SwapContainer>
  );
};
