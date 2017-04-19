import { connect } from 'react-redux'
import Apex from './component'
import { mapStateToProps, mapDispatchToProps } from './props'

export default connect(mapStateToProps, mapDispatchToProps)(Apex)
