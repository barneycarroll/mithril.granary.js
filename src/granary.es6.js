import m from 'mithril'

// Every view adds it's controller to 
// this set, then removes it after
// execution: thus every view can look
// to breadcrumbs to determine its
// ancestry
const breadcrumbs = new Set()
const ancestry    = new WeakMap()
// When a component asks to be
// redrawn, it and its ancestry are 
// added to the live set
const live        = new Set()

const wrap = view =>
  function viewWrapper( ctrl ){
    // We're in a granular redraw
    if( live.size ){
      // ...and this component doesn't
      // require execution
      if( !live.has( ctrl ) )
        // So we exit early
        return { subtree : 'retain' }
      
      // If not, remove it from live
      // and proceed
      live.delete( ctrl )
    }
    
    // Drop a breadcrumb
    breadcrumbs.add( ctrl )
    
    // Make a record of our ancestry
    ancestry.set( ctrl, Array.from( breadcrumbs ) )
    
    // Execute the view
    const output = view( ...arguments )
    
    // Follow the trail back
    breadcrumbs.delete( ctrl )
    
    return output
}

function redraw( ctrl ){
  // If an item has an ancestry, 
  // it can be redrawn!
  if( ancestry.has( ctrl ) )
    // Add the ancestry to the 
    // live set
    ancestry.get( ctrl ).forEach(
      ancestor =>
        live.add( ancestor )
    )
  
  // Redraw!
  m.redraw( ...arguments )
}

export { redraw, wrap }
