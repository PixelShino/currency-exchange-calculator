import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = 'https://api.frankfurter.app/';

function App() {
  const [currencies, setCurrencies] = useState([]);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCurrencies() {
      setLoading(true);
      try {
        const response = await fetch(API_URL + 'latest');
        const data = await response.json();
        
        // Get currency list and add base currency
        const currencyList = Object.keys(data.rates);
        currencyList.push(data.base);
        currencyList.sort();
        
        setCurrencies(currencyList);
        
        // Set default currencies
        if (currencyList.includes('EUR') && currencyList.includes('USD')) {
          setFromCurrency('EUR');
          setToCurrency('USD');
        } else if (currencyList.length >= 2) {
          setFromCurrency(currencyList[0]);
          setToCurrency(currencyList[1]);
        }
      } catch (err) {
        setError('Failed to load currencies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCurrencies();
  }, []);

  // Currency swap function
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    
    // Recalculate if there's an amount
    if (amount && amount > 0) {
      convertCurrency();
    }
  };

  // Conversion function
  async function convertCurrency() {
    // Validation
    if (!amount) {
      setError('Please enter an amount');
      return;
    } else if (amount <= 0) {
      setError('Amount must be greater than zero');
      return;
    } else if (fromCurrency === toCurrency) {
      setOutput({
        amount: parseFloat(amount),
        base: fromCurrency,
        rates: { [toCurrency]: parseFloat(amount) }
      });
      setError('');
      return;
    } else {
      setError('');
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
      );
      
      if (!response.ok) {
        throw new Error('Conversion error');
      }
      
      const data = await response.json();
      setOutput(data);
    } catch (err) {
      setError('Failed to convert currency');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && amount) {
      convertCurrency();
    }
  };

  return (
    <div className='app'>
      <h1>Currency Exchange Calculator</h1>

      <div className='converter-container'>
        {error && <p className='error'>{error}</p>}

        <div className='input-group'>
          <input
            type='number'
            placeholder='Amount'
            className='input-field'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || currencies.length === 0}
          />
          
          <select
            className='dropdown'
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            disabled={loading || currencies.length === 0}
          >
            {currencies.map((currency) => (
              <option key={`from-${currency}`} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          
          <button 
            className='swap-button' 
            onClick={swapCurrencies}
            title='Swap currencies'
            disabled={loading}
          >
            ⇄
          </button>
          
          <select
            className='dropdown'
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            disabled={loading || currencies.length === 0}
          >
            {currencies.map((currency) => (
              <option key={`to-${currency}`} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        
        <button
          className='convert-button'
          onClick={convertCurrency}
          disabled={loading || !amount || currencies.length === 0}
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>

        {output && output.rates && (
          <div className='result'>
            <span className='result-amount'>{output.amount} {output.base}</span>
            <span className='result-equals'>=</span>
            <span className='result-converted'>
              {Object.values(output.rates)[0]} {Object.keys(output.rates)[0]}
            </span>
          </div>
        )}
      </div>
      
      <footer className='footer'>
        <p>Data provided by Frankfurter API</p>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
}

export default App;
