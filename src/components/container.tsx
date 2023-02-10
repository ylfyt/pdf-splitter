import { FC, ReactNode } from 'react';

interface ContainerProps {
	children: ReactNode;
}

const Container: FC<ContainerProps> = ({ children }) => {
	return <div className="w-3/4 xl:w-1/2">{children}</div>;
};

export default Container;
