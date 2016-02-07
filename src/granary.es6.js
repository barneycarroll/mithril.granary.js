import m from 'mithril'

const views = new WeakMap()
const live  = new Set()

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
    
    views.set( ctrl, () =>
      viewWrapper( ...arguments )
    )
    
    // Execute the view
    const output = view( ...arguments )
    
    const config = output.args.config
    
    output.args.config = function superConfig( el ){
      roots.set( ctrl, el )
      
      if( config )
        config( ...arguments )
    }
    
    return output
}

function redraw( ctrl ){
  if( roots.has( ctrl ) )
    live.add( ctrl )
  
  // Redraw!
  m.redraw( ...arguments )
}

m.mount(
  document.createElement( 'x' ),
  { view : () => {
    if( !live.size )
      return 
    
    live.forEach( ctrl => {
      const root   = roots.get( ctrl )
      const parent = el.parentNode
      
      m.mount( parent, {
        view : () =>
        Array.from( parent.childNodes ).map( child =>
            child === root
            ? view.get( ctrl )()
            : { subtree : 'retain' }
          )
      } )
    } )
  } }
)

export { redraw, wrap }
