import SAMF_Phonetic from './utils/phonetic';
import {
	showItemClass,
	hideItemClass,
	adminMenuSearchFieldClass,
	adminMenuFilterName,
	adminMenuSearch
} from './const/samf';
import {
	currentSubMenuClass,
	hasSubMenuClass,
	menuNameClass,
	menuTopClass,
	adminMenuWrapId,
	adminMenuId,
} from './const/wordpress';

/**
 * Smart Admin Menu Filter.
 */
class Smart_Admin_Menu_Filter {

	/**
	 * Admin Menu Filter Constructor.
	 */
	constructor() {
		this.adminMenuWrap = document.getElementById( adminMenuWrapId );
		this.adminMenu     = document.getElementById( adminMenuId );
	}

	/**
	 * Initialize Smart Admin Menu Filter.
	 */
	init() {
		this.SAMFPhonetic    = new SAMF_Phonetic();
		this.adminMenuItems = this.getAdminMenu() || [];
		this.createAdminSearchField();
	}

	getAdminMenu() {
		let menuItems = {};
		// Build the admin menu object.
		this.adminMenu.querySelectorAll( 'li.' + menuTopClass ).forEach(( menuTopItem ) => {
			let menuNameDiv = menuTopItem.querySelector( '.' + menuNameClass );
			let menuName    = menuNameDiv.textContent || menuNameDiv.innerText;

			menuItems[ menuTopItem.id ] = {
				element: menuTopItem,
				label: this.SAMFPhonetic.strToDoubleMetaphone( menuName ),
				subMenuWrap: null,
				classes: menuTopItem.classList || [],
				subMenu: [],
			};

			// If the admin menu item has a sub-menu, iterate over each sub-item.
			if ( menuTopItem.classList.contains( hasSubMenuClass ) ) {
				let subMenuWrap = menuTopItem.querySelector('ul');

				menuItems[ menuTopItem.id ].subMenuWrap = {
					element: subMenuWrap,
					classes: subMenuWrap.classList || [],
				};

				subMenuWrap.querySelectorAll( 'li' ).forEach( ( subMenuListItem ) => {
					let subMenuLink = subMenuListItem.querySelector( 'a' );
					if ( subMenuLink ) {

						// Get the text of the sub menu link to compare against the search term.
						let subMenuListItemName = subMenuLink.textContent || subMenuLink.text;

						menuItems[ menuTopItem.id ].subMenu.push({
							element: subMenuListItem,
							label: this.SAMFPhonetic.strToDoubleMetaphone( subMenuListItemName ),
							classes: subMenuListItem.classList || [],
						});
					}
				});
			}
		});

		return menuItems;
	}

	/**
	 * Create Smart Admin Menu Filter Search Field.
	 */
	createAdminSearchField() {
		this.menuSearchField = document.createElement( 'input' );

		const adminSearchField = new Promise( ( resolve, reject ) => {
			try {
				// Add the classes and attributes to search input and wrapping elements.
				this.menuSearchField.classList.add( adminMenuSearchFieldClass );
				this.menuSearchField.setAttribute( 'name', adminMenuFilterName );
				this.menuSearchField.setAttribute( 'type', 'text' );
				this.menuSearchField.setAttribute( 'value', '' );
				this.menuSearchField.setAttribute( 'placeholder', 'Search Admin Menu' );

				const menuSearch = document.createElement( 'div' );
				menuSearch.setAttribute( 'id', adminMenuSearch );
				menuSearch.append( this.menuSearchField );

				this.adminMenuWrap.prepend( menuSearch );

				resolve( true );
			} catch ( e ) {
				reject( false );
			}
		});

		// Once the search field has been created and added,
		// add the event listeners.
		adminSearchField.then( () => {
			this.addListeners();
		});
	}

	/**
	 * Add event listeners for search field.
	 */
	addListeners() {
		this.menuSearchField.addEventListener( 'keyup', ( e ) => {
			this.searchMenu( e.target.value );
		});
	}

	/**
	 * Perform the admin menu search.
	 *
	 * @param  {string}  searchTerm  Search term.
	 */
	searchMenu( searchTerm ) {
		let matchFound = false;
		searchTerm     = searchTerm.trim();

		const menuSeparator = document.querySelectorAll('.wp-menu-separator');
		if ( searchTerm ) {
			menuSeparator.forEach((separator) => {
				separator.classList.add('samf-admin-hide-item');
			});
		} else {
			menuSeparator.forEach((separator) => {
				separator.classList.remove('samf-admin-hide-item');
			});
		}

		Object.values( this.adminMenuItems ).forEach( ( menuTopItem ) => {
			let subItemMatch   = false;
			const subMenuWrap  = menuTopItem.subMenuWrap;
			const menuTopLabel = menuTopItem.label;

			// Reset the top level menu item to initial state
			// if there is no search text.
			if ( ! searchTerm ) {
				this.resetItem( menuTopItem );

				if ( subMenuWrap ) {
					this.resetItem( subMenuWrap );
				}
			}

			// Set true if there is a phonetic phrase match.
			matchFound = this.SAMFPhonetic.isMatch( searchTerm, menuTopLabel );

			menuTopItem.subMenu.forEach( ( subMenuListItem ) => {
				let subMenuLabel = subMenuListItem.label;

				// Reset sub menu to initial state.
				//this.resetItem( subMenuListItem );

				// Check the sub menu link for a phonetic match to the search term.
				if ( this.SAMFPhonetic.isMatch( searchTerm, subMenuLabel ) ) {
					subItemMatch = true;
					this.showItem( subMenuListItem );
				} else {
					// Display the item if we have a top level match
					// but not a sub item match. Sub menu items are
					// hidden by default unless they are in the
					// current selected menu.
					if ( matchFound ) {
						this.showItem( subMenuListItem );
					} else {
						this.hideItem( subMenuListItem );
					}
				}

				// Reset the sub menu to initial state if there
				// isn't a search term.
				if ( ! searchTerm.length ) {
 					this.resetItem( subMenuListItem );
				}
			});

			if ( searchTerm.length ) {
				// Hide the entire menu item if we don't have a
				// top level or sub item match.
				if (
					! matchFound &&
					! subItemMatch
				) {
					this.hideItem( menuTopItem );
				} else {
					this.showItem( menuTopItem );
				}

				if ( subMenuWrap ) {
					// If we have a sub menu item match, toggle on
					// the display of the entire sub menu. Otherwise,
					// hide the sub menu if it isn't in the current
					// select menu.
					if (subItemMatch) {
						if (!subMenuWrap.classes.contains(currentSubMenuClass)) {
							this.showItem( subMenuWrap );
						} else {
							this.hideItem( subMenuWrap );
						}
					} else {
						if ( ! subMenuWrap.classes.contains( currentSubMenuClass ) ) {
							this.hideItem( subMenuWrap );
						} else {
							this.showItem( subMenuWrap );
						}
					}
				}
			}
		});
	}

	/**
	 * Show a menu item.
	 *
	 * @param  {Element}  menuItem  Menu Item.
	 */
	showItem( menuItem ) {
		if ( ! menuItem.classes.contains( showItemClass ) ) {
			let menuItemClassList = menuItem.element.classList;
			menuItemClassList.add( showItemClass );
			menuItem.classes = menuItemClassList;
		}
		if ( menuItem.classes.contains( hideItemClass ) ) {
			let menuItemClassList = menuItem.element.classList;
			menuItemClassList.remove( hideItemClass );
			menuItem.classes = menuItemClassList;
		}
	}

	/**
	 * Hide a menu item.
	 *
	 * @param  {Element}  menuItem  Menu Item.
	 */
	hideItem( menuItem ) {
		if ( menuItem.classes.contains( showItemClass ) ) {
			let menuItemClassList = menuItem.element.classList;
			menuItemClassList.remove( showItemClass );
			menuItem.classes = menuItemClassList;
		}
		if ( ! menuItem.classes.contains( hideItemClass ) ) {
			let menuItemClassList = menuItem.element.classList;
			menuItemClassList.add( hideItemClass );
			menuItem.classes = menuItemClassList;
		}
	}

	/**
	 * Reset the menu item.
	 *
	 * @param  {Element}  menuItem  Menu Item.
	 */
	resetItem( menuItem ) {
		if ( menuItem.classes.contains( showItemClass ) ) {
			let menuItemClassList = menuItem.element.classList;
			menuItemClassList.remove( showItemClass );
			menuItem.classes = menuItemClassList;
		}
		if ( menuItem.classes.contains( hideItemClass ) ) {
			let menuItemClassList = menuItem.element.classList;
			menuItemClassList.remove( hideItemClass );
			menuItem.classes = menuItemClassList;
		}
	}
}

/**
 * Initialize the Smart Admin Menu Filter on Document load.
 */
document.addEventListener('DOMContentLoaded', () => {
	const smartAdminMenuFilter = new Smart_Admin_Menu_Filter();
	smartAdminMenuFilter.init();
});