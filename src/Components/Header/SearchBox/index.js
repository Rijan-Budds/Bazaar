import Button from '@mui/material/Button';
import { FaSearch } from 'react-icons/fa';

const SearchBox = () => {
    return(
    <div className='headerSearch ml-3'>
        <input type='text' placeholder="Search products..." />
        <Button><FaSearch /></Button>
    </div>
    );
}

export default SearchBox;   