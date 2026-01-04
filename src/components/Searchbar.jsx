const Searchbar = () => {
    return (
        <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-w-[800px] w-fit mx-auto gap-4 transition-shadow duration-300 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col relative min-w-[120px]">
                <select
                    defaultValue=""
                    className="appearance-none bg-transparent border-none text-base font-medium text-gray-800 p-2 cursor-pointer outline-none w-full bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0px_center] bg-[length:0.65rem_auto] pr-6"
                >
                    <option value="" disabled>Category</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                </select>
            </div>

            <div className="w-px h-6 bg-gray-200"></div>

            <div className="flex flex-col relative min-w-[120px]">
                <select
                    defaultValue=""
                    className="appearance-none bg-transparent border-none text-base font-medium text-gray-800 p-2 cursor-pointer outline-none w-full bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0px_center] bg-[length:0.65rem_auto] pr-6"
                >
                    <option value="" disabled>Service</option>
                    <option value="stitching">Stitching</option>
                    <option value="alteration">Alteration</option>
                    <option value="design">Design</option>
                </select>
            </div>

            <div className="w-px h-6 bg-gray-200"></div>

            <div className="flex flex-col relative min-w-[120px]">
                <select
                    defaultValue=""
                    className="appearance-none bg-transparent border-none text-base font-medium text-gray-800 p-2 cursor-pointer outline-none w-full bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0px_center] bg-[length:0.65rem_auto] pr-6"
                >
                    <option value="" disabled>Location</option>
                    <option value="ny">New York</option>
                    <option value="la">Los Angeles</option>
                    <option value="ch">Chicago</option>
                </select>
            </div>

            <button className="bg-black text-white border-none rounded-full px-6 py-3 font-semibold cursor-pointer transition-all duration-200  hover:bg-gray-800 hover:-translate-y-[1px] active:translate-y-0">
                Search
            </button>
        </div>
    )
}

export default Searchbar