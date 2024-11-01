import {doubleMetaphone} from 'double-metaphone';

/**
 * Phonetic helpers.
 */
export default class SAMF_Phonetic {

	/**
	 * Convert a string to double metaphone.
	 *
	 * @param    {string}  string  String to convert to double metaphone.
	 *
	 * @returns  {array}           Double metaphone array of string.
	 */
	strToDoubleMetaphone( string ) {
		return doubleMetaphone( string );
	}

	/**
	 * Compare two strings for a double metaphone match.
	 *
	 * @param    {string}  str1     First compare string.
	 * @param    {array}   dmArray  Second compare string.
	 *
	 * @returns  {boolean}          Returns true if a match was found.
	 */
	isMatch( str1, dmArray ) {
		const dmStrArray = this.strToDoubleMetaphone( str1 );
		return dmStrArray.find( dmStr1 => {
			return dmArray.find( dmStr2 => {
				return dmStr2.search( dmStr1 ) > -1;
			});
		});
	}
}